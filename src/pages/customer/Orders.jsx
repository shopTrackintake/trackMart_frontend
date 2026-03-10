import { useEffect, useState } from "react";
import { getUserOrders } from "../../services/orderService";

export default function Orders() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ORDERS ================= */

  useEffect(() => {

    const fetchOrders = async () => {

      try {

        const res = await getUserOrders();

        setOrders(res.data);

      } catch (err) {

        console.log(err.response?.data);

      } finally {

        setLoading(false);

      }

    };

    fetchOrders();

  }, []);

  return (

    <div className="space-y-8">

      {/* HEADER */}

      <div>

        <h1 className="text-3xl font-primary font-bold text-textStrong">
          My Orders
        </h1>

        <p className="text-textDefault mt-2">
          View and track your purchases.
        </p>

      </div>


      {/* LOADING */}

      {loading && (

        <div className="text-textMuted">
          Loading...
        </div>

      )}


      {/* EMPTY STATE */}

      {!loading && orders.length === 0 && (

        <div className="bg-bgSurfaceAlt border border-borderDefault rounded-2xl p-8 text-center text-textMuted">

          No orders placed yet.

        </div>

      )}


      {/* ORDERS */}

      <div className="space-y-6">

        {orders.map((order) => (

          <div
            key={order.id}
            className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-6"
          >

            {/* ORDER HEADER */}

            <div className="flex justify-between items-center mb-4">

              <div>

                <p className="font-semibold text-textStrong">
                  Order ID: {order.id.slice(0,8)}
                </p>

                <p className="text-textMuted text-sm">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>

              </div>

              <p className="text-primary font-bold">
                ₹{order.total_amount}
              </p>

            </div>


            {/* ORDER STATUS */}

            <div className="mb-4">

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  order.order_status === "delivered"
                    ? "bg-green-200 text-green-800"
                    : order.order_status === "confirmed"
                    ? "bg-blue-200 text-blue-800"
                    : "bg-yellow-200 text-yellow-800"
                }`}
              >

                {order.order_status === "delivered"
                  ? "Delivered"
                  : order.order_status === "confirmed"
                  ? "Confirmed"
                  : "Pending"}

              </span>

            </div>


            {/* DELIVERY DATE */}

            {order.delivery_date && (

              <p className="text-sm text-gray-500 mb-4">

                Expected Delivery:{" "}
                {new Date(order.delivery_date).toLocaleDateString()}

              </p>

            )}


            {/* ORDER ITEMS */}

            <div className="space-y-3">

              {order.items?.map((item) => (

                <div
                  key={item.id}
                  className="flex justify-between items-center border-t border-borderDefault pt-3"
                >

                  <div>

                    <p className="text-textStrong font-medium">
                      {item.product_title}
                    </p>

                    <p className="text-textMuted text-sm">
                      Qty: {item.quantity}
                    </p>

                  </div>


                  {/* HEALTH TAG */}

                  {item.health_rating && (

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.health_rating === "Healthy"
                          ? "bg-green-100 text-successText"
                          : "bg-red-100 text-dangerText"
                      }`}
                    >

                      {item.health_rating}

                    </span>

                  )}

                </div>

              ))}

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}