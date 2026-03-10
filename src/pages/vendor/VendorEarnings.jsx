import { useEffect, useState } from "react";
import api from "../../services/api";
import Footer from "../../components/Footer";

export default function VendorEarnings() {

  const [earnings, setEarnings] = useState({
    total: 0,
    orders: []
  });

  useEffect(() => {

    const fetchEarnings = async () => {
      const res = await api.get("/vendor/earnings");
      setEarnings(res.data);
    };

    fetchEarnings();

  }, []);

  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-bold">
        Earnings
      </h1>

      <div className="text-2xl font-bold text-green-600">
        Total Earnings: ₹{earnings.total}
      </div>

      <div className="space-y-4">

        {earnings.orders.map(order => (

          <div
            key={order.id}
            className="border p-5 rounded-xl"
          >

            <p className="font-semibold">
              {order.product_title}
            </p>

            <p className="text-sm">
              Quantity: {order.quantity}
            </p>

            <p className="text-green-600 font-bold">
              ₹{order.vendor_earning}
            </p>

          </div>

        ))}

      </div>
<Footer/>
    </div>
  );
}