import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { AuthContext } from "./AuthContext";
import { getCart, updateCartItem, mergeCart, removeCartItem, clearCart as apiClearCart } from "../services/cartService";

export const CartContext = createContext();

const GUEST_CART_KEY = "trackmart_guest_cart";

export const getItemEffectivePrice = (item) => {
  const originalPrice = Number(item.price) || 0;
  const discount = Number(item.discount_percent) || 0;
  if (discount > 0) {
    return Math.round(originalPrice * (1 - discount / 100));
  }
  return originalPrice;
};

export function CartProvider({ children }) {
  const { role, user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Helper to read guest cart safely */
  const loadGuestCart = () => {
    try {
      const raw = localStorage.getItem(GUEST_CART_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(i => Number(i.quantity) > 0) : [];
    } catch (e) {
      console.error("Failed to parse guest cart:", e);
      return [];
    }
  };

  /* Helper to persist guest cart */
  const saveGuestCart = (items) => {
    try {
      const valid = items.filter(i => Number(i.quantity) > 0);
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(valid));
    } catch (e) {
      console.error("Failed to save guest cart:", e);
    }
  };

  /* Sync guest cart to authenticated customer */
  const syncGuestCartToUser = useCallback(async () => {
    const guestItems = loadGuestCart();
    if (!guestItems.length) return;

    try {
      // Attempt merge endpoint first
      try {
        await mergeCart(
          guestItems.map(item => ({
            product_id: item.product_id || item.id,
            quantity: Math.max(1, Number(item.quantity) || 1)
          }))
        );
      } catch (mergeErr) {
        // Fallback: sequential updateCartItem if /merge is pending restart
        console.warn("mergeCart route fallback to updateCartItem:", mergeErr);
        for (const item of guestItems) {
          const pid = item.product_id || item.id;
          const qty = Math.max(1, Number(item.quantity) || 1);
          await updateCartItem(pid, qty);
        }
      }

      // Clear guest cart storage
      localStorage.removeItem(GUEST_CART_KEY);

      // Refetch user's complete cart from backend
      const res = await getCart();
      const valid = (res.data || []).filter(item => Number(item.quantity) > 0);
      setCartItems(valid);
    } catch (err) {
      console.error("Error syncing guest cart to customer account:", err);
    }
  }, []);

  /* Load cart based on auth state */
  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      if (role === "customer") {
        // First check if there is an unmerged guest cart to sync
        const guestItems = loadGuestCart();
        if (guestItems.length > 0) {
          await syncGuestCartToUser();
        } else {
          const res = await getCart();
          const valid = (res.data || []).filter(item => Number(item.quantity) > 0);
          setCartItems(valid);
        }
      } else if (!role) {
        // Guest user: load from localStorage
        const guestItems = loadGuestCart();
        setCartItems(guestItems);
      } else {
        // Vendor or Admin
        setCartItems([]);
      }
    } catch (err) {
      console.error("Error refreshing cart:", err);
    } finally {
      setLoading(false);
    }
  }, [role, syncGuestCartToUser]);

  /* Run refresh on role/user change */
  useEffect(() => {
    refreshCart();
  }, [refreshCart, user?.id]);

  /* Total count badge (sum of quantities) */
  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  }, [cartItems]);

  /* ADD TO CART */
  const addToCart = async (product, qty = 1) => {
    const addQuantity = Math.max(1, Number(qty) || 1);
    const productId = product.id || product.product_id;

    if (!productId) return;

    if (role === "customer") {
      // Optimistic state update
      setCartItems(prev => {
        const idx = prev.findIndex(p => (p.id || p.product_id) === productId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: (Number(next[idx].quantity) || 0) + addQuantity };
          return next;
        }
        return [...prev, { ...product, id: productId, quantity: addQuantity }];
      });

      try {
        await updateCartItem(productId, addQuantity);
        // Refresh to ensure server sync
        const res = await getCart();
        setCartItems((res.data || []).filter(item => Number(item.quantity) > 0));
      } catch (err) {
        console.error("Error updating backend cart:", err);
        refreshCart();
      }
    } else {
      // Guest: persist locally
      setCartItems(prev => {
        const idx = prev.findIndex(p => (p.id || p.product_id) === productId);
        let next;
        if (idx >= 0) {
          next = [...prev];
          next[idx] = { ...next[idx], quantity: (Number(next[idx].quantity) || 0) + addQuantity };
        } else {
          next = [...prev, { ...product, id: productId, quantity: addQuantity }];
        }
        saveGuestCart(next);
        return next;
      });
    }
  };

  /* UPDATE QUANTITY (DIRECTLY TO newQty) */
  const updateQuantity = async (productId, newQty) => {
    const targetQty = Number(newQty);
    if (targetQty <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (role === "customer") {
      const existing = cartItems.find(p => (p.id || p.product_id) === productId);
      const currentQty = existing ? Number(existing.quantity) : 0;
      const delta = targetQty - currentQty;

      setCartItems(prev =>
        prev.map(p =>
          (p.id || p.product_id) === productId
            ? { ...p, quantity: targetQty }
            : p
        )
      );

      try {
        if (delta !== 0) {
          await updateCartItem(productId, delta);
        }
      } catch (err) {
        console.error("Error updating cart quantity on server:", err);
        refreshCart();
      }
    } else {
      setCartItems(prev => {
        const next = prev.map(p =>
          (p.id || p.product_id) === productId
            ? { ...p, quantity: targetQty }
            : p
        );
        saveGuestCart(next);
        return next;
      });
    }
  };

  /* REMOVE FROM CART */
  const removeFromCart = async (productId) => {
    if (role === "customer") {
      const existing = cartItems.find(p => (p.id || p.product_id) === productId);
      const currentQty = existing ? Number(existing.quantity) : 0;

      setCartItems(prev => prev.filter(p => (p.id || p.product_id) !== productId));

      try {
        try {
          await removeCartItem(productId);
        } catch {
          if (currentQty > 0) {
            await updateCartItem(productId, -currentQty);
          }
        }
      } catch (err) {
        console.error("Error removing from cart on server:", err);
        refreshCart();
      }
    } else {
      setCartItems(prev => {
        const next = prev.filter(p => (p.id || p.product_id) !== productId);
        saveGuestCart(next);
        return next;
      });
    }
  };

  /* CLEAR CART */
  const clearCart = async () => {
    if (role === "customer") {
      setCartItems([]);
      try {
        await apiClearCart();
      } catch (err) {
        console.error("Error clearing server cart:", err);
      }
    } else {
      setCartItems([]);
      localStorage.removeItem(GUEST_CART_KEY);
    }
  };

  /* Get quantity of specific product in cart */
  const getProductQuantity = (productId) => {
    const item = cartItems.find(p => String(p.id || p.product_id) === String(productId));
    return item ? Number(item.quantity) : 0;
  };

  /* FINANCIAL TOTALS */
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const unit = getItemEffectivePrice(item);
      return acc + unit * (Number(item.quantity) || 1);
    }, 0);
  }, [cartItems]);

  const originalSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const orig = Number(item.price) || 0;
      return acc + orig * (Number(item.quantity) || 1);
    }, 0);
  }, [cartItems]);

  const discountSavings = useMemo(() => {
    return Math.max(0, originalSubtotal - subtotal);
  }, [originalSubtotal, subtotal]);

  // Delivery charge calculation: free over ₹499
  const estimatedDelivery = useMemo(() => {
    if (cartItems.length === 0) return 0;
    if (subtotal >= 499) return 0;
    // Check if any product has explicit delivery charges, else standard ₹40
    const highestDelivery = cartItems.reduce((max, item) => {
      const charge = Number(item.delivery_charge);
      return !isNaN(charge) && charge > max ? charge : max;
    }, 0);
    return highestDelivery > 0 ? highestDelivery : 40;
  }, [cartItems, subtotal]);

  const grandTotal = useMemo(() => {
    return subtotal + estimatedDelivery;
  }, [subtotal, estimatedDelivery]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getProductQuantity,
        refreshCart,
        syncGuestCartToUser,
        subtotal,
        originalSubtotal,
        discountSavings,
        estimatedDelivery,
        grandTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
