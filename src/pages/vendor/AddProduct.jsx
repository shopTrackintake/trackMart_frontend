import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getCategories } from "../../services/categoryService";
import { createProduct, getProductById, updateProduct } from "../../services/productService";
import { 
  Package, Tag, IndianRupee, Percent, Layers, 
  Upload, X, Check, Activity, FileText, Image as ImageIcon 
} from "lucide-react";

export default function AddProduct({ isEdit = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [categories, setCategories] = useState([]);

  const [productImgPreview, setProductImgPreview] = useState(null);
  const [ingredientsImgPreview, setIngredientsImgPreview] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    care_type: "",
    concern_type: "",
    ingredients: "",
    price: "",
    discount_percent: "",
    stock: "",
    size: "",
    calories: "",
    sugar: "",
    fat: "",
    protein: "",
    how_to_use: "",
    making_process: "",
    product_image: null,
    ingredients_image: null
  });

  /* ================= FETCH CATEGORIES & EDIT DATA ================= */
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const catRes = await getCategories();
        setCategories(catRes.data);

        if (isEdit && id) {
          const prodRes = await getProductById(id);
          const p = prodRes.data;

          setForm({
            title: p.title || "",
            description: p.description || "",
            category_id: p.category_id || "",
            care_type: p.care_type || "",
            concern_type: p.concern_type || "",
            ingredients: p.ingredients || "",
            price: p.price || "",
            discount_percent: p.discount_percent || "",
            stock: p.stock !== undefined ? p.stock : "",
            size: p.size || "",
            calories: p.calories || "",
            sugar: p.sugar || "",
            fat: p.fat || "",
            protein: p.protein || "",
            how_to_use: p.how_to_use || "",
            making_process: p.making_process || "",
            product_image: null,
            ingredients_image: null
          });

          if (p.image_url) {
            setProductImgPreview(
              p.image_url.startsWith("http")
                ? p.image_url
                : `http://localhost:5000/uploads/${p.image_url}`
            );
          }

          if (p.ingredients_image_url) {
            setIngredientsImgPreview(
              p.ingredients_image_url.startsWith("http")
                ? p.ingredients_image_url
                : `http://localhost:5000/uploads/${p.ingredients_image_url}`
            );
          }
        }
      } catch (err) {
        console.log(err);
      } finally {
        setFetching(false);
      }
    };

    fetchInitialData();
  }, [isEdit, id]);

  /* ================= HEALTH CALCULATOR ================= */
  const calculateHealth = () => {
    if (Number(form.sugar) > 20 || Number(form.fat) > 20 || Number(form.calories) > 500) {
      return "Unhealthy";
    }
    return "Healthy";
  };

  /* ================= CALCULATE SELLING PRICE ================= */
  const calculateSellingPrice = () => {
    const basePrice = Number(form.price) || 0;
    const discount = Number(form.discount_percent) || 0;
    if (discount <= 0) return basePrice;
    return Math.max(0, Math.round(basePrice * (1 - discount / 100)));
  };

  /* ================= MULTI-SELECT CHIP TOGGLE ================= */
  const handleChipToggle = (field, value) => {
    let values = form[field] ? form[field].split(",").map((v) => v.trim()).filter(Boolean) : [];

    if (values.includes(value)) {
      values = values.filter((v) => v !== value);
    } else {
      values.push(value);
    }

    setForm({
      ...form,
      [field]: values.join(",")
    });
  };

  /* ================= FILE SELECTION HANDLERS ================= */
  const handleProductImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, product_image: file });
      setProductImgPreview(URL.createObjectURL(file));
    }
  };

  const handleIngredientsImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, ingredients_image: file });
      setIngredientsImgPreview(URL.createObjectURL(file));
    }
  };

  /* ================= FORM SUBMISSION ================= */
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;

    try {
      if (!form.title || !form.price || form.stock === "" || !form.size) {
        alert("Please fill all required fields (Title, Price, Stock, Size)");
        return;
      }

      setLoading(true);

      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (form[key] !== null && form[key] !== "") {
          formData.append(key, form[key]);
        }
      });

      formData.append("vendor_claimed_health", calculateHealth());

      if (isEdit && id) {
        await updateProduct(id, formData, token);
        alert("Product updated successfully!");
        navigate("/vendor/products");
      } else {
        await createProduct(formData, token);
        alert("Product added successfully!");
        navigate("/vendor/products");
      }
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Error saving product");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const careOptions = ["Skin Care", "Hair Care", "Digestive Care", "Immunity Care", "Heart Care"];
  const concernOptions = ["Immunity", "Digestion", "Skin Health", "Weight Loss", "Energy Boost"];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-primary flex items-center gap-2">
            <Package className="w-8 h-8 text-primary" />
            <span>
              <span className="text-primary">{isEdit ? "Edit" : "Add New"}</span>{" "}
              <span className="text-slate-900">Product</span>
            </span>
          </h1>
          <p className="text-textMuted text-sm mt-1">
            {isEdit
              ? "Update product details, pricing, and stock status"
              : "Create a new product listing for your store catalog"}
          </p>
        </div>

        <button
          onClick={() => navigate("/vendor/products")}
          className="px-4 py-2 border rounded-xl text-sm font-semibold hover:bg-gray-100 transition"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: BASIC INFORMATION */}
        <div className="bg-white border border-borderDefault rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-textStrong flex items-center gap-2 border-b pb-3">
            <FileText className="w-5 h-5 text-primary" />
            Basic Product Information
          </h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Product Title <span className="text-red-500">*</span>
            </label>
            <input
              value={form.title}
              placeholder="e.g. Organic Herbal Green Tea"
              className="w-full border border-borderDefault rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Product Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              placeholder="Write a clear description of the product benefits and features..."
              className="w-full border border-borderDefault rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition"
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Product Category
            </label>
            <select
              value={form.category_id}
              className="w-full border border-borderDefault rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition"
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SECTION 2: PRICING & INVENTORY */}
        <div className="bg-white border border-borderDefault rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-textStrong flex items-center gap-2 border-b pb-3">
            <IndianRupee className="w-5 h-5 text-primary" />
            Pricing, Discount & Stock Inventory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                MRP / Base Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  placeholder="500"
                  className="w-full border border-borderDefault rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition pl-9"
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
                <span className="absolute left-3 top-3.5 text-gray-400 font-bold text-sm">₹</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Discount Percent (% <span className="text-gray-400 font-normal">Optional</span>)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={form.discount_percent}
                  placeholder="e.g. 15"
                  className="w-full border border-borderDefault rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition pr-9"
                  onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                />
                <Percent className="w-4 h-4 absolute right-3 top-3.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Available Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.stock}
                placeholder="100"
                className="w-full border border-borderDefault rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition"
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
          </div>

          {/* DYNAMIC DISCOUNT CALCULATOR SUMMARY */}
          {Number(form.price) > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider block">
                  Customer Price Calculation
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-2xl font-bold text-emerald-800">
                    ₹{calculateSellingPrice()}
                  </span>
                  {Number(form.discount_percent) > 0 && (
                    <>
                      <span className="text-sm text-gray-400 line-through">
                        ₹{form.price}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        {form.discount_percent}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-xs text-emerald-700 max-w-xs">
                {Number(form.discount_percent) > 0
                  ? `Customers will save ₹${Number(form.price) - calculateSellingPrice()} on this product.`
                  : "No discount applied. Customers pay full base price."}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Weight / Size <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.size}
              placeholder="e.g. 250g / 500ml / 60 Tablets"
              className="w-full border border-borderDefault rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition"
              onChange={(e) => setForm({ ...form, size: e.target.value })}
            />
          </div>
        </div>

        {/* SECTION 3: CARE TYPE & HEALTH CONCERNS */}
        <div className="bg-white border border-borderDefault rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-textStrong flex items-center gap-2 border-b pb-3">
            <Tag className="w-5 h-5 text-primary" />
            Care Types & Health Concerns
          </h2>

          {/* Care Type Pills */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Care Type Tags
            </label>
            <div className="flex flex-wrap gap-2.5">
              {careOptions.map((item) => {
                const selected = form.care_type?.split(",").map((v) => v.trim()).includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => handleChipToggle("care_type", item)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                      selected
                        ? "bg-primary text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {selected && <Check className="w-4 h-4" />}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Concern Pills */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Targeted Health Concerns
            </label>
            <div className="flex flex-wrap gap-2.5">
              {concernOptions.map((item) => {
                const selected = form.concern_type?.split(",").map((v) => v.trim()).includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => handleChipToggle("concern_type", item)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                      selected
                        ? "bg-primary text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {selected && <Check className="w-4 h-4" />}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                How to Use / Directions
              </label>
              <textarea
                rows={3}
                value={form.how_to_use}
                placeholder="e.g. Mix 1 spoon in warm water every morning..."
                className="w-full border border-borderDefault rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition"
                onChange={(e) => setForm({ ...form, how_to_use: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Making / Processing Method
              </label>
              <textarea
                rows={3}
                value={form.making_process}
                placeholder="e.g. Cold-pressed from organic herbs..."
                className="w-full border border-borderDefault rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition"
                onChange={(e) => setForm({ ...form, making_process: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: PRODUCT IMAGES & PREVIEWS */}
        <div className="bg-white border border-borderDefault rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-textStrong flex items-center gap-2 border-b pb-3">
            <ImageIcon className="w-5 h-5 text-primary" />
            Product Images & Labels
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Image */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Main Product Photo
              </label>

              {productImgPreview ? (
                <div className="relative h-48 border border-borderDefault rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center p-4 group">
                  <img
                    src={productImgPreview}
                    alt="Product Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, product_image: null });
                      setProductImgPreview(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="h-48 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition p-4">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm font-semibold text-gray-700">Click to Upload Product Image</span>
                  <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProductImageChange}
                  />
                </label>
              )}
            </div>

            {/* Ingredients Photo */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Ingredients Label Photo (<span className="text-gray-400 font-normal">Optional</span>)
              </label>

              {ingredientsImgPreview ? (
                <div className="relative h-48 border border-borderDefault rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center p-4 group">
                  <img
                    src={ingredientsImgPreview}
                    alt="Ingredients Label Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, ingredients_image: null });
                      setIngredientsImgPreview(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="h-48 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition p-4">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm font-semibold text-gray-700">Upload Ingredients Label Photo</span>
                  <span className="text-xs text-gray-400 mt-1">Useful for verification</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleIngredientsImageChange}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 5: NUTRITIONAL FACTS & INGREDIENTS */}
        <div className="bg-white border border-borderDefault rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-textStrong flex items-center gap-2 border-b pb-3">
            <Activity className="w-5 h-5 text-primary" />
            Nutritional Facts & Ingredients
          </h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Ingredients List
            </label>
            <textarea
              rows={2}
              value={form.ingredients}
              placeholder="e.g. Green Tea Extracts, Ashwagandha, Tulsi, Cardamom..."
              className="w-full border border-borderDefault rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition"
              onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Calories (kcal)</label>
              <input
                type="number"
                value={form.calories}
                placeholder="e.g. 50"
                className="w-full border border-borderDefault rounded-xl px-3 py-2 text-sm"
                onChange={(e) => setForm({ ...form, calories: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Sugar (g)</label>
              <input
                type="number"
                value={form.sugar}
                placeholder="e.g. 2"
                className="w-full border border-borderDefault rounded-xl px-3 py-2 text-sm"
                onChange={(e) => setForm({ ...form, sugar: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Fat (g)</label>
              <input
                type="number"
                value={form.fat}
                placeholder="e.g. 1"
                className="w-full border border-borderDefault rounded-xl px-3 py-2 text-sm"
                onChange={(e) => setForm({ ...form, fat: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Protein (g)</label>
              <input
                type="number"
                value={form.protein}
                placeholder="e.g. 5"
                className="w-full border border-borderDefault rounded-xl px-3 py-2 text-sm"
                onChange={(e) => setForm({ ...form, protein: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                calculateHealth() === "Healthy"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-red-100 text-red-800 border border-red-300"
              }`}
            >
              Health Rating: {calculateHealth()}
            </span>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate("/vendor/products")}
            className="px-6 py-3 border border-borderDefault rounded-xl text-sm font-semibold hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primaryHover transition shadow-md disabled:opacity-50"
          >
            {loading ? "Saving..." : isEdit ? "Update Product" : "Publish Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
