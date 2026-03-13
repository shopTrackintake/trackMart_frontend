import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function VendorProducts() {

  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {

      const res = await api.get("/products/vendor");
      setProducts(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);


  const deleteProduct = async (id) => {

    if (!window.confirm("Delete this product?")) return;

    try {

      await api.delete(`/products/${id}`);
      fetchProducts();

    } catch (err) {
      console.log(err);
    }
  };


  return (

    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        <h1 className="text-2xl sm:text-3xl font-bold mb-8">
          My Products
        </h1>


        {/* PRODUCT GRID */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">


          {products.map(p => (

            <div
              key={p.id}
              onClick={() => navigate(`/product/${p.id}`)}
              className="bg-bgSurface border border-borderDefault rounded-xl shadow-card hover:shadow-lg transition cursor-pointer flex flex-col overflow-hidden"
            >

              {/* IMAGE */}

              <div className="h-40 bg-gray-50 flex items-center justify-center p-4">

                <img
                  src={
                    p.image_url?.startsWith("http")
      ? p.image_url
      : `${import.meta.env.VITE_API_URL}/uploads/${p.image_url}`
  }
                  alt={p.title}
                  className="max-h-full object-contain"
                />

              </div>


              {/* CONTENT */}

              <div className="flex flex-col flex-grow p-4 space-y-2">

                {/* TITLE */}

                <h2 className="font-semibold text-lg text-textStrong line-clamp-1">
                  {p.title}
                </h2>


                {/* PRICE */}

                <p className="text-primary font-bold">
                  ₹{p.price}
                </p>


                {/* SIZE + STOCK */}

                <p className="text-xs text-textMuted">
                  Weight: {p.size} | Stock: {p.stock}
                </p>


                {/* DESCRIPTION */}

                <p className="text-sm text-textMuted line-clamp-2">
                  {p.description}
                </p>


                {/* DELETE BUTTON */}

                <div className="mt-auto pt-4 flex justify-end">

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProduct(p.id);
                    }}
                    className="text-dangerText text-sm font-medium hover:underline"
                  >
                    Delete
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

      <Footer />
    </>

  );
}
