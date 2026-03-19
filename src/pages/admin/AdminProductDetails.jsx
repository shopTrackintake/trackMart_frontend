import { useEffect,useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";

export default function AdminProductDetails(){

const { id } = useParams();
const [product,setProduct] = useState(null);
const [selectedImage, setSelectedImage] = useState(null);
useEffect(()=>{

const fetchProduct = async()=>{

try{

const res = await api.get(`/admin/products/${id}`);
setProduct(res.data);

}catch(err){
console.log(err);
}

};

fetchProduct();

},[id]);


if(!product) return <p className="text-center mt-10">Loading...</p>;

const benefits =
typeof product.benefits === "string"
? JSON.parse(product.benefits)
: product.benefits;


return(

<div className="max-w-5xl mx-auto space-y-8">

<h1 className="text-3xl font-bold">
Product Details
</h1>


<div className="bg-bgSurface border border-borderDefault rounded-2xl p-8 space-y-8">


{/* IMAGE + BASIC INFO */}

<div className="grid md:grid-cols-2 gap-8">

<img
src={product.image_url}
className="w-full max-w-sm rounded-xl"
/>


<div className="space-y-3">

<h2 className="text-2xl font-semibold">
{product.title}
</h2>

{/* PRODUCT STATUS */}

{product.status === "inactive" && (
<span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-dangerText">
Product Removed
</span>
)}

<p className="text-textMuted">
Vendor: {product.business_name}
</p>

<p className="text-lg font-semibold">
₹{product.price}
</p>



<p className="text-sm text-textMuted">
Category: {product.category_name || product.category_id}
</p>

<p className="text-sm text-textMuted">
Size: {product.size}
</p>


{/* STOCK */}

<div className="flex items-center gap-3">

<span className="text-sm text-textMuted">
Stock: {product.stock}
</span>

{product.stock === 0 ? (
<span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-dangerText">
Out of Stock
</span>
) : product.stock < 5 ? (
<span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-warningText">
Low Stock
</span>
) : (
<span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-successText">
In Stock
</span>
              )}

            </div>

       

        {/* ✅ INGREDIENT LABEL (FULL WIDTH) */}
        {product.ingredients_image_url && (

          <div className="relative">

            <h3 className="font-semibold text-lg">
              Ingredients Label
            </h3>

            <div className="flex gap-2 mt-3">

              {product.ingredients_image_url.split(",").map((img, i) => (

                <div
                  key={i}
                  className="w-12 h-12 rounded-lg overflow-hidden border cursor-pointer"
                  onClick={() => setSelectedImage(img.trim())}
                >
                  <img
                    src={img.trim()}
                    className="w-full h-full object-cover"
                  />
                </div>

              ))}

            </div>

            {/* FLOATING OVERLAY */}
            {selectedImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl z-10">

                <div className="relative">

                  <img
                    src={selectedImage}
                    className="max-h-[200px] object-contain rounded-lg"
                  />

                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-1 right-1 bg-white rounded-full px-2 text-sm"
                  >
                    ✕
                  </button>

                </div>

              </div>
            )}

          </div>

        )}

        {/* ✅ KEY INGREDIENTS */}
        {product.ingredients && (

          <div className="mt-4">

            <h3 className="font-semibold text-lg">
              Key Ingredients
            </h3>

            <div className="flex flex-wrap gap-2 mt-2">

              {product.ingredients.split("\n").map((item, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-sm bg-gray-100 border rounded-full"
                >
                  {item}
                </span>
              ))}

            </div>

          </div>

        )}
   </div>

        </div>
{/* DESCRIPTION */}

<div>

<h3 className="font-semibold text-lg">
Description
</h3>

<p className="text-textMuted mt-2">
{product.description}
</p>

</div>


{/* NUTRITION */}

<div>

<h3 className="font-semibold text-lg mb-4">
Nutrition Information
</h3>

<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

<div className="bg-yellow-100 p-3 rounded text-center">
Calories
<br/>
<strong>{product.calories}</strong>
</div>

<div className="bg-green-100 p-3 rounded text-center">
Protein
<br/>
<strong>{product.protein} g</strong>
</div>

<div className="bg-orange-100 p-3 rounded text-center">
Fat
<br/>
<strong>{product.fat} g</strong>
</div>

<div className="bg-blue-100 p-3 rounded text-center">
Sugar
<br/>
<strong>{product.sugar} g</strong>
</div>

</div>

</div>



{/* HOW TO USE */}

{product.how_to_use && (

<div>

<h3 className="font-semibold text-lg">
How to Use
</h3>

<ul className="list-disc pl-6 mt-2 space-y-1 text-textMuted">

{product.how_to_use.split("\n").map((item,i)=>(
<li key={i}>{item}</li>
))}

</ul>

</div>

)}


{/* MAKING PROCESS */}

{product.making_process && (

<div>

<h3 className="font-semibold text-lg">
Making Process
</h3>

<ul className="list-disc pl-6 mt-2 space-y-1 text-textMuted">

{product.making_process.split("\n").map((item,i)=>(
<li key={i}>{item}</li>
))}

</ul>

</div>

)}


{/* BENEFITS */}

{benefits && benefits.length > 0 && (

<div>

<h3 className="font-semibold text-lg mb-4">
Benefits
</h3>

<div className="grid md:grid-cols-3 gap-6">

{benefits.map((b,i)=>(

<div
key={i}
className="border border-borderDefault rounded-xl overflow-hidden shadow-sm"
>

<img
src={b.image}
className="w-full h-40 object-cover"
/>

<div className="p-4">

<h4 className="font-semibold">
{b.title}
</h4>

<p className="text-sm text-textMuted mt-1">
{b.description}
</p>

</div>

</div>

))}

</div>

</div>

)}

</div>

</div>

);

}