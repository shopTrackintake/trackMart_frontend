import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import PublicLayout from "./layouts/PublicLayout";
import VendorLayout from "./layouts/VendorLayout";
import AdminLayout from "./layouts/AdminLayout";
import CustomerLayout from "./layouts/CustomerLayout";
import ProductDetails from "./pages/public/ProductDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import VendorOrders from "./pages/vendor/VendorOrders";
import VendorOrderDetails from "./pages/vendor/VendorOrderDetails";
import VendorEarnings from "./pages/vendor/VendorEarnings";
/* Public Pages */
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import RegisterCustomer from "./pages/public/RegisterCustomer";
import ApplyVendor from "./pages/public/ApplyVendor";
import VendorProducts from "./pages/vendor/VendorProducts";
import Wishlist from "./pages/public/Wishlist";
/* Vendor Pages */
import VendorDashboard from "./pages/vendor/VendorDashboard";
import AddProduct from "./pages/vendor/AddProduct";
import VendorPayments from "./pages/vendor/VendorPayments";
import VendorProductDetails from "./pages/vendor/VendorProductDetails";
/* Admin Pages */
import AdminVendorPayments from "./pages/admin/AdminVendorPayments";
import AdminProductDetails from "./pages/admin/AdminProductDetails";
import AdminProducts from "./pages/admin/AdminProducts";
import Vendors from "./pages/admin/Vendors";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ApproveVendors from "./pages/admin/ApproveVendors";
import Cart from "./pages/public/Cart";
import Checkout from "./pages/public/Checkout";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminVendorDetails from "./pages/admin/AdminVendorDetails";
/* Customer Pages */
import Orders from "./pages/customer/Orders";
import CustomerOrderDetails from "./pages/customer/CustomerOrderDetails";
import Support from "./pages/customer/Support";
import AdminSupport from "./pages/admin/AdminSupport";
import PrivacyPolicy from "./pages/policies/PrivacyPolicy";
import TermsOfService from "./pages/policies/TermsOfService";
import RefundPolicy from "./pages/policies/RefundPolicy";
import ShippingPolicy from "./pages/policies/ShippingPolicy";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";

import Buy from "./pages/customer/Buy";

function RootRoute() {
  const { role, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (role === "customer") return <Navigate to="/buy" replace />;
  if (role === "vendor") return <Navigate to="/vendor" replace />;
  if (role === "admin") return <Navigate to="/admin" replace />;

  return <Home />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ================= */}
        <Route element={<PublicLayout />}>
          <Route index element={<RootRoute />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<RegisterCustomer />} />
          <Route path="apply-vendor" element={<ApplyVendor />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsOfService />} />
          <Route path="refund" element={<RefundPolicy />} />
          <Route path="shipping" element={<ShippingPolicy />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* ================= CUSTOMER ================= */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/customer" element={<Navigate to="/buy" replace />} />
          <Route path="/buy" element={<Buy />} />
          <Route path="/customer/buy" element={<Buy />} />
          <Route path="/customer/wishlist" element={<Navigate to="/buy" replace />} />
          <Route path="/support" element={<Support />} />
          <Route path="/customer/orders" element={<Orders />} />
          <Route path="/customer/orders/:id" element={<CustomerOrderDetails />} />
          <Route path="/customer/cart" element={<Cart />} />
          <Route path="/customer/checkout" element={<Checkout />} />
        </Route>

        {/* ================= VENDOR ================= */}
        <Route
          path="vendor"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <VendorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<VendorDashboard />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="edit-product/:id" element={<AddProduct isEdit={true} />} />
          <Route path="products" element={<VendorProducts />} />
          <Route path="products/:id" element={<VendorProductDetails />} />
          <Route path="payments" element={<VendorPayments />} />
          <Route path="orders" element={<VendorOrders />} />
          <Route path="earnings" element={<VendorEarnings />} />
          <Route path="orders/:id" element={<VendorOrderDetails />} />
          <Route path="profile" element={<Profile />} />
          <Route path="support" element={<Support />} />
        </Route>

        {/* ================= ADMIN ================= */}
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="/admin/support" element={<AdminSupport />} />
          <Route path="vendors/:id" element={<AdminVendorDetails/>}/>
          <Route path="vendor-payments" element={<AdminVendorPayments />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/:id" element={<AdminProductDetails />} />
          <Route path="orders" element={<AdminOrders/>}/>
          <Route path="vendors" element={<Vendors />} />
          <Route path="approve-vendors" element={<ApproveVendors />} />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}
export default App;