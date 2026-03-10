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
    <div className="space-y-12">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-primary font-bold text-textStrong">
          Vendor Dashboard
        </h1>
        <p className="text-textDefault mt-2">
          Manage your products and track your performance.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        <div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-6">
          <p className="text-textMuted text-sm">Total Products</p>
          <h2 className="text-3xl font-bold text-textStrong mt-2">
            {loading ? "..." : stats.products}
          </h2>
        </div>

        <div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-6">
          <p className="text-textMuted text-sm">Total Orders</p>
          <h2 className="text-3xl font-bold text-textStrong mt-2">
            {loading ? "..." : stats.orders}
          </h2>
        </div>

        <div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-6">
          <p className="text-textMuted text-sm">Total Earnings</p>
          <h2 className="text-3xl font-bold text-primary mt-2">
            {loading ? "..." : `₹${stats.earnings}`}
          </h2>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-8 space-y-6">

        <h2 className="text-xl font-semibold text-textStrong">
          Quick Actions
        </h2>

        <div className="flex flex-wrap gap-6">

          <Link
            to="/vendor/add-product"
            className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primaryHover transition"
          >
            Add New Product
          </Link>
<Link
  to="/vendor/products"
  className="bg-bgSurfaceAlt border border-borderDefault px-8 py-3 rounded-xl font-semibold hover:bg-bgSurface transition"
>
  My Products
</Link>
          <Link
            to="/vendor/orders"
            className="bg-bgSurfaceAlt border border-borderDefault px-8 py-3 rounded-xl font-semibold hover:bg-bgSurface transition"
          >
            View Orders
          </Link>

          <Link
            to="/vendor/earnings"
            className="bg-bgSurfaceAlt border border-borderDefault px-8 py-3 rounded-xl font-semibold hover:bg-bgSurface transition"
          >
            View Earnings
          </Link>
          <Link
  to="/vendor/payments"
  className="bg-bgSurfaceAlt border border-borderDefault px-8 py-3 rounded-xl font-semibold hover:bg-bgSurface transition"
>
  My Payments
</Link>

        </div>

      </div>
<Footer/>
    </div>
  );
}