import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { getVendorStats } from "../../services/vendorService";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";

export default function VendorDashboard() {

  const { token } = useContext(AuthContext);

  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    earnings: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchStats = async () => {
      try {
        const res = await getVendorStats(token);
        setStats(res.data);
      } catch (err) {
        console.log("Stats Error:", err);
        setStats({ products: 0, orders: 0, earnings: 0 });
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchStats();

  }, [token]);

  return (
    <div className="space-y-10 md:space-y-12 px-4 md:px-0">

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-primary font-bold text-textStrong">
          Vendor Dashboard
        </h1>
        <p className="text-textDefault mt-2 text-sm md:text-base">
          Manage your products and track your performance.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">

        <div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-4 md:p-6">
          <p className="text-textMuted text-sm">Total Products</p>
          <h2 className="text-2xl md:text-3xl font-bold text-textStrong mt-2">
            {loading ? "..." : stats.products}
          </h2>
        </div>

        <div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-4 md:p-6">
          <p className="text-textMuted text-sm">Total Orders</p>
          <h2 className="text-2xl md:text-3xl font-bold text-textStrong mt-2">
            {loading ? "..." : stats.orders}
          </h2>
        </div>

        <div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-4 md:p-6">
          <p className="text-textMuted text-sm">Total Earnings</p>
          <h2 className="text-2xl md:text-3xl font-bold text-primary mt-2">
            {loading ? "..." : `₹${stats.earnings}`}
          </h2>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-4 md:p-8 space-y-6">

        <h2 className="text-lg md:text-xl font-semibold text-textStrong">
          Quick Actions
        </h2>

        {/* ✅ BUTTON GRID FIX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-3 md:gap-6">

          <Link
            to="/vendor/add-product"
            className="h-12 flex items-center justify-center text-center bg-primary text-white px-6 md:px-8 rounded-xl font-semibold hover:bg-primaryHover transition"
          >
            Add New Product
          </Link>

          <Link
            to="/vendor/products"
            className="h-12 flex items-center justify-center text-center bg-bgSurfaceAlt border border-borderDefault px-6 md:px-8 rounded-xl font-semibold hover:bg-bgSurface transition"
          >
            My Products
          </Link>

          <Link
            to="/vendor/orders"
            className="h-12 flex items-center justify-center text-center bg-bgSurfaceAlt border border-borderDefault px-6 md:px-8 rounded-xl font-semibold hover:bg-bgSurface transition"
          >
            View Orders
          </Link>

          <Link
            to="/vendor/earnings"
            className="h-12 flex items-center justify-center text-center bg-bgSurfaceAlt border border-borderDefault px-6 md:px-8 rounded-xl font-semibold hover:bg-bgSurface transition"
          >
            View Earnings
          </Link>

          <Link
            to="/vendor/payments"
            className="h-12 flex items-center justify-center text-center bg-bgSurfaceAlt border border-borderDefault px-6 md:px-8 rounded-xl font-semibold hover:bg-bgSurface transition"
          >
            My Payments
          </Link>

        </div>

      </div>

      <Footer />

    </div>
  );
}