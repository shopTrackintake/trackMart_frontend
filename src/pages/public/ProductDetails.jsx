import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProducts } from "../../services/productService";

export default function ProductDetails() {

  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchProducts = async () => {
      try {
        const res = await getProducts();

        // UUID string match
        const found = res.data.find(p => p.id === id);

        setProduct(found);

      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!product) return <p className="text-center mt-10">Product not found</p>;

  return (
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">

      {/* IMAGE */}
      <div className="h-[450px] bg-gray-50 rounded-2xl shadow flex items-center justify-center">
        {product.image_url && (
          <img
            src={`${import.meta.env.VITE_API_URL}/uploads/${product.image_url}`}
            alt={product.title}
            className="max-h-full max-w-full object-contain"
          />
        )}
      </div>

      {/* DETAILS */}
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{product.title}</h1>
        <p>{product.description}</p>
        <div className="text-2xl font-bold text-primary">
          ₹{product.price}
        </div>
        <div className="text-sm text-gray-500">
          Available: {product.stock} gm
        </div>
      </div>

    </div>
  );
}