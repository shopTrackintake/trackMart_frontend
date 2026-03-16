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
    care_type: "",
    concern_type: "",
    ingredients: "",
    price: "",
    stock: "",
    size: "",
    delivery_charge: "",
    calories: "",
    sugar: "",
    fat: "",
    protein: "",
    how_to_use: "",
    making_process: "",
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
        console.log(err);
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

  /* ================= MULTI SELECT HANDLER ================= */

  const handleMultiSelect = (field, value, checked) => {

    let values = form[field] ? form[field].split(",") : [];

    if (checked) {
      if (!values.includes(value)) values.push(value);
    } else {
      values = values.filter(v => v !== value);
    }

    setForm({
      ...form,
      [field]: values.join(",")
    });

  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {

    try {

      if (!form.title || !form.price || !form.stock || !form.size) {
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
        care_type: "",
        concern_type: "",
        ingredients: "",
        price: "",
        stock: "",
        size: "",
        delivery_charge: "",
        calories: "",
        sugar: "",
        fat: "",
        protein: "",
        how_to_use: "",
        making_process: "",
        product_image: null,
        ingredients_image: null
      });

    } catch (err) {

      console.log(err);
      alert(err.response?.data?.message || "Error adding product");

    }

  };

  return (

    <div className="max-w-4xl mx-auto space-y-10">

      <h1 className="text-3xl font-bold">
        Add New Product
      </h1>

      {/* PRODUCT INFO */}

      <div className="bg-white border rounded-2xl shadow p-8 space-y-6">

        <input
          value={form.title}
          placeholder="Product Title"
          className="w-full border rounded-xl px-4 py-3"
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          value={form.description}
          placeholder="Description"
          className="w-full border rounded-xl px-4 py-3"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* CATEGORY */}

        <select
          value={form.category_id}
          className="w-full border rounded-xl px-4 py-3"
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
        >

          <option value="">Select Category</option>

          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}

        </select>

        {/* CARE TYPE */}

        <div>

          <p className="text-sm font-semibold mb-2">
            Select Care Type
          </p>

          <div className="grid grid-cols-2 gap-3">

            {[
              "Skin Care",
              "Hair Care",
              "Digestive Care",
              "Immunity Care",
              "Heart Care"
            ].map(item => (

              <label key={item} className="flex items-center gap-2 cursor-pointer">

                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={form.care_type?.split(",").includes(item)}
                  onChange={(e) =>
                    handleMultiSelect("care_type", item, e.target.checked)
                  }
                />

                {item}

              </label>

            ))}

          </div>

        </div>

        {/* CONCERN TYPE */}

        <div>

          <p className="text-sm font-semibold mb-2">
            Select Concern
          </p>

          <div className="grid grid-cols-2 gap-3">

            {[
              "Immunity",
              "Digestion",
              "Skin Health",
              "Weight Loss",
              "Energy Boost"
            ].map(item => (

              <label key={item} className="flex items-center gap-2 cursor-pointer">

                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={form.concern_type?.split(",").includes(item)}
                  onChange={(e) =>
                    handleMultiSelect("concern_type", item, e.target.checked)
                  }
                />

                {item}

              </label>

            ))}

          </div>

        </div>

        {/* PRICE + STOCK */}

        <div className="grid grid-cols-2 gap-6">

          <input
            type="number"
            value={form.price}
            placeholder="Price"
            className="border rounded-xl px-4 py-3"
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />

          <input
            type="number"
            value={form.stock}
            placeholder="Stock"
            className="border rounded-xl px-4 py-3"
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />

        </div>

        <input
          type="text"
          value={form.size}
          placeholder="Size (100g / 250g)"
          className="w-full border rounded-xl px-4 py-3"
          onChange={(e) => setForm({ ...form, size: e.target.value })}
        />

        <input
          type="number"
          value={form.delivery_charge}
          placeholder="Delivery Charge"
          className="w-full border rounded-xl px-4 py-3"
          onChange={(e) => setForm({ ...form, delivery_charge: e.target.value })}
        />

        <textarea
          value={form.how_to_use}
          placeholder="How to Use"
          className="w-full border rounded-xl px-4 py-3"
          onChange={(e) => setForm({ ...form, how_to_use: e.target.value })}
        />

        <textarea
          value={form.making_process}
          placeholder="Making Process"
          className="w-full border rounded-xl px-4 py-3"
          onChange={(e) => setForm({ ...form, making_process: e.target.value })}
        />

        <p>Product Image</p>

        <input
          type="file"
          accept="image/*"
          className="w-full border rounded-xl px-4 py-3"
          onChange={(e) =>
            setForm({ ...form, product_image: e.target.files[0] })
          }
        />

      </div>

      {/* NUTRITION */}

      <div className="bg-white border rounded-2xl shadow p-8 space-y-6">

        <textarea
          value={form.ingredients}
          placeholder="Ingredients"
          className="w-full border rounded-xl px-4 py-3"
          onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
        />

        <p className="text-sm text-gray-500">
          Take photo of ingredients label
        </p>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="w-full border rounded-xl px-4 py-3"
          onChange={(e) =>
            setForm({ ...form, ingredients_image: e.target.files[0] })
          }
        />

        <div className="grid grid-cols-4 gap-4">

          <input
            type="number"
            value={form.calories}
            placeholder="Calories"
            className="border rounded-xl px-4 py-3"
            onChange={(e) => setForm({ ...form, calories: e.target.value })}
          />

          <input
            type="number"
            value={form.sugar}
            placeholder="Sugar"
            className="border rounded-xl px-4 py-3"
            onChange={(e) => setForm({ ...form, sugar: e.target.value })}
          />

          <input
            type="number"
            value={form.fat}
            placeholder="Fat"
            className="border rounded-xl px-4 py-3"
            onChange={(e) => setForm({ ...form, fat: e.target.value })}
          />

          <input
            type="number"
            value={form.protein}
            placeholder="Protein"
            className="border rounded-xl px-4 py-3"
            onChange={(e) => setForm({ ...form, protein: e.target.value })}
          />

        </div>

        <span className={`px-4 py-2 rounded-full text-sm font-semibold
        ${calculateHealth() === "Healthy"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"}`}>

          Health Rating: {calculateHealth()}

        </span>

      </div>

      <div className="flex justify-end">

        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-10 py-3 rounded-xl"
        >
          Add Product
        </button>

      </div>

      <Footer />

    </div>

  );

}