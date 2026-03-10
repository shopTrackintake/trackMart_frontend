import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { getCategories } from "../../services/categoryService";
import { createProduct } from "../../services/productService";
import Footer from "../../components/Footer";

export default function AddProduct() {

  const { token } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    ingredients: "",
    price: "",
    stock: "",
    delivery_charge: "",
    calories: "",
    sugar: "",
    fat: "",
    protein: "",
    product_image: null,
    ingredients_image: null
  });

  /* ================= LOAD CATEGORIES ================= */
  useEffect(() => {

    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data);
      } catch (err) {
        console.log("Category Error:", err);
      }
    };

    fetchCategories();

  }, []);

  /* ================= HEALTH PREVIEW ================= */
  const calculateHealth = () => {
    if (Number(form.sugar) > 20 || Number(form.fat) > 20) {
      return "Unhealthy";
    }
    return "Healthy";
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    try {

      if (!form.title || !form.price || !form.stock) {
        alert("Please fill required fields");
        return;
      }

      const formData = new FormData();

      Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== "") {
          formData.append(key, form[key]);
        }
      });

      formData.append("vendor_claimed_health", calculateHealth());

      await createProduct(formData, token);

      alert("Product added successfully");

      setForm({
        title: "",
        description: "",
        category_id: "",
        ingredients: "",
        price: "",
        stock: "",
        delivery_charge: "",
        calories: "",
        sugar: "",
        fat: "",
        protein: "",
        product_image: null,
        ingredients_image: null
      });

    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Error adding product");
    }
  };

  return (
    <div className="max-w-4xl space-y-10">

      <h1 className="text-3xl font-primary font-bold text-textStrong">
        Add New Product
      </h1>

      {/* PRODUCT INFO */}
      <div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-8 space-y-6">

        <input
          value={form.title}
          placeholder="Product Title"
          className="w-full border border-borderDefault rounded-xl px-4 py-3"
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          value={form.description}
          placeholder="Description"
          className="w-full border border-borderDefault rounded-xl px-4 py-3"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <select
          value={form.category_id}
          className="w-full border border-borderDefault rounded-xl px-4 py-3"
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-6">
          <input
            type="number"
            value={form.price}
            placeholder="Price"
            className="border border-borderDefault rounded-xl px-4 py-3"
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />

          <input
            type="number"
            value={form.stock}
            placeholder="Stock (gm)"
            className="border border-borderDefault rounded-xl px-4 py-3"
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />

          {/* DELIVERY CHARGE */}
          <input
            type="number"
            value={form.delivery_charge}
            placeholder="Delivery Charge"
            className="border border-borderDefault rounded-xl px-4 py-3"
            onChange={(e) =>
              setForm({ ...form, delivery_charge: e.target.value })
            }
          />
        </div>
<p>Product image</p>
        <input
          type="file"
          accept="image/*"
          className="w-full border border-borderDefault rounded-xl px-4 py-3"
          onChange={(e) =>
            setForm({ ...form, product_image: e.target.files[0] })
          }
        />

      </div>

      {/* NUTRITION */}
      <div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-8 space-y-6">

        <textarea
          value={form.ingredients}
          placeholder="Ingredients"
          className="w-full border border-borderDefault rounded-xl px-4 py-3"
          onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
        />

<p className="text-sm text-textMuted">
Take photo of ingredients label
</p>

   <input
  type="file"
  accept="image/*"
  capture="environment"
  className="w-full border border-borderDefault rounded-xl px-4 py-3"
  onChange={(e) =>
    setForm({ ...form, ingredients_image: e.target.files[0] })
  }
/>

        <div className="grid grid-cols-4 gap-4">
          <input
            type="number"
            value={form.calories}
            placeholder="Calories"
            className="border border-borderDefault rounded-xl px-4 py-3"
            onChange={(e) => setForm({ ...form, calories: e.target.value })}
          />
          <input
            type="number"
            value={form.sugar}
            placeholder="Sugar (g)"
            className="border border-borderDefault rounded-xl px-4 py-3"
            onChange={(e) => setForm({ ...form, sugar: e.target.value })}
          />
          <input
            type="number"
            value={form.fat}
            placeholder="Fat (g)"
            className="border border-borderDefault rounded-xl px-4 py-3"
            onChange={(e) => setForm({ ...form, fat: e.target.value })}
          />
          <input
            type="number"
            value={form.protein}
            placeholder="Protein (g)"
            className="border border-borderDefault rounded-xl px-4 py-3"
            onChange={(e) => setForm({ ...form, protein: e.target.value })}
          />
        </div>

        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            calculateHealth() === "Healthy"
              ? "bg-green-100 text-successText"
              : "bg-red-100 text-dangerText"
          }`}
        >
          Health Rating: {calculateHealth()}
        </span>

      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-primary text-white px-10 py-3 rounded-xl font-semibold hover:bg-primaryHover transition"
        >
          Add Product
        </button>
      </div>
<Footer/>
    </div>
  );
}