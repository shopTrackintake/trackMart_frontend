import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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
import Wishlist from "./pages/public/Wishlist";
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import RegisterCustomer from "./pages/public/RegisterCustomer";
import ApplyVendor from "./pages/public/ApplyVendor";
import VendorProducts from "./pages/vendor/VendorProducts";
/* Vendor Pages */
import VendorDashboard from "./pages/vendor/VendorDashboard";
import AddProduct from "./pages/vendor/AddProduct";
import VendorPayments from "./pages/vendor/VendorPayments";
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
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import Orders from "./pages/customer/Orders";
import Support from "./pages/customer/Support";
import AdminSupport from "./pages/admin/AdminSupport";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ================= */}
        <Route element={<PublicLayout />}>
          <Route path="/wishlist" element={<Wishlist/>} />
  <Route index element={<Home />} />
  <Route path="login" element={<Login />} />
  <Route path="register" element={<RegisterCustomer />} />
  <Route path="apply-vendor" element={<ApplyVendor />} />
  <Route path="cart" element={<Cart />} />
  <Route path="checkout" element={<Checkout />} />
  <Route path="product/:id" element={<ProductDetails />} />
</Route>
{/* ================= CUSTOMER ================= */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/support" element={<Support />} />
          <Route path="/customer/orders" element={<Orders />} />
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

  {/* NEW */}
  <Route path="payments" element={<VendorPayments />} />
  <Route path="orders" element={<VendorOrders />} />
  <Route path="earnings" element={<VendorEarnings />} />
  <Route path="orders/:id" element={<VendorOrderDetails />} />
</Route>
<Route
 path="/vendor/products"
 element={<VendorProducts/>}
/>
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
