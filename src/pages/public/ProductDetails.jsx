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
  <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">

    {/* TOP SECTION */}
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

      {/* IMAGE */}
      <div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-4 sm:p-6 flex items-center justify-center">

        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="max-h-[280px] sm:max-h-[420px] object-contain"
          />
        ) : (
          <div className="text-textMuted">No Image</div>
        )}

      </div>


      {/* RIGHT DETAILS */}
      <div className="space-y-5">

        {/* TITLE */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-primary font-bold text-primary">
          {product.title}
        </h1>

        {/* PRICE */}
        <div className="text-2xl sm:text-3xl font-semibold text-green-600">
          ₹{product.price}
        </div>

        {/* SIZE */}
        <div className="text-sm sm:text-base text-textMuted">
          Size: <span className="font-semibold text-textStrong">{product.size}</span>
        </div>

        {/* STOCK */}
        {product.stock === 0 ? (
          <span className="inline-block bg-red-100 text-dangerText px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
            Out of Stock
          </span>
        ) : (
          <span className="inline-block bg-green-100 text-successText px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
            In Stock ({product.stock})
          </span>
        )}
{/* NUTRITION STATS */}

<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

  <div className="rounded-xl p-4 text-center"
       style={{background:"var(--color-stat-1-bg)"}}>

    <p className="text-sm text-textMuted">Calories</p>
    <p className="text-xl font-bold text-textStrong">
      {product.calories}
    </p>

  </div>

  <div className="rounded-xl p-4 text-center"
       style={{background:"var(--color-stat-2-bg)"}}>

    <p className="text-sm text-textMuted">Protein</p>
    <p className="text-xl font-bold text-textStrong">
      {product.protein} g
    </p>

  </div>

  <div className="rounded-xl p-4 text-center"
       style={{background:"var(--color-stat-4-bg)"}}>

    <p className="text-sm text-textMuted">Fat</p>
    <p className="text-xl font-bold text-textStrong">
      {product.fat} g
    </p>

  </div>

  <div className="rounded-xl p-4 text-center"
       style={{background:"var(--color-stat-3-bg)"}}>

    <p className="text-sm text-textMuted">Sugar</p>
    <p className="text-xl font-bold text-textStrong">
      {product.sugar} g
    </p>

  </div>

</div>
        {/* DESCRIPTION */}
        <div className="bg-bgSurface border border-borderDefault rounded-xl p-4 sm:p-5 shadow-card">
          <h2 className="text-base sm:text-lg font-semibold text-black mb-2">
            Description
          </h2>

          <p className="text-sm sm:text-base text-textStrong leading-relaxed">
            {product.description}
          </p>
        </div>

      </div>
    </div>


   


    {/* HOW TO USE */}
    {product.how_to_use && (
      <div className="bg-bgSurface border border-borderDefault rounded-xl p-4 sm:p-6 shadow-card">

        <h2 className="text-base sm:text-lg font-semibold text-black mb-3">
          How to Use
        </h2>

        <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base text-textStrong">
          {product.how_to_use.split("\n").map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

      </div>
    )}


    {/* MAKING PROCESS */}
    {product.making_process && (
      <div className="bg-bgSurface border border-borderDefault rounded-xl p-4 sm:p-6 shadow-card">

        <h2 className="text-base sm:text-lg font-semibold text-black mb-3">
          Making Process
        </h2>

        <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base text-textStrong">
          {product.making_process.split("\n").map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

      </div>
    )}
 {/* BENEFITS SECTION */}

    {product.benefits && product.benefits.length > 0 && (

      <div className="space-y-8">

        <h2 className="text-2xl sm:text-3xl font-bold text-center">
          Benefits
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

          {product.benefits.map((benefit, index) => (

            <div
              key={index}
              className="bg-bgSurface border border-borderDefault rounded-xl shadow-card overflow-hidden hover:shadow-lg transition"
            >

              <img
                src={benefit.image}
                alt={benefit.title}
                className="w-full h-44 sm:h-52 object-cover"
              />

              <div className="p-4 sm:p-6 space-y-2">

                <h3 className="text-base sm:text-lg font-semibold text-textStrong">
                  {benefit.title}
                </h3>

                <p className="text-sm text-textStrong leading-relaxed">
                  {benefit.description}
                </p>

              </div>

            </div>

          ))}

        </div>

      </div>

    )}
  </div>
);
}