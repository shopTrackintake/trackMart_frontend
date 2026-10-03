import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getCategories } from "../../services/categoryService";
import { createProduct, getProductById, updateProduct } from "../../services/productService";
import { 
  Package, Tag, IndianRupee, Percent, Layers, 
  Upload, X, Check, Activity, FileText, Image as ImageIcon,
  Flame, Award, Scale, Calendar, Building, ShieldCheck,
  CheckCircle2, Plus, Sparkles, HeartPulse, Info
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
    brand_name: "",
    sku: "",
    barcode: "",
    care_type: "",
    concern_type: "",
    dietary_type: "",
    flavour: "",
    size: "",
    net_weight: "",
    serving_size: "",
    servings_per_container: "",
    price: "",
    discount_percent: "",
    stock: "",
    calories: "",
    sugar: "",
    fat: "",
    protein: "",
    nutrition_per_100g: "",
    nutrition_per_serving: "",
    ingredients: "",
    how_to_use: "",
    making_process: "",
    manufacturer_name: "",
    manufacturer_address: "",
    batch_number: "",
    mfg_date: "",
    expiry_date: "",
    fssai_license: "",
    product_image: null,
    ingredients_image: null
  });

  const careOptions = [
    "Muscle & Fitness Care",
    "Sports & Workout Care",
    "Digestive & Gut Care",
    "Immunity & Wellness Care",
    "Weight & Metabolism Care",
    "Bone & Joint Care",
    "Heart & Cholesterol Care",
    "Skin Care",
    "Hair Care",
    "Diabetes & Sugar Care",
    "Stress & Sleep Care",
    "Men's Health",
    "Women's Health"
  ];

  const concernOptions = [
    "Muscle Building & Recovery",
    "Stamina & Energy Boost",
    "Weight Gain & Mass",
    "Weight Loss & Fat Burn",
    "Immunity Support",
    "Digestion & Bloating",
    "Joint Mobility",
    "Skin Health & Glow",
    "Hair Fall Control",
    "Blood Sugar Management",
    "Stress Relief",
    "General Wellbeing"
  ];

  const dietaryOptions = [
    "Vegetarian",
    "Non-Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Keto-Friendly",
    "Sugar-Free",
    "Dairy-Free",
    "Organic",
    "Halal"
  ];

  /* ================= FETCH CATEGORIES & EDIT DATA ================= */
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const catRes = await getCategories();
        setCategories(catRes.data || []);

        if (isEdit && id) {
          const prodRes = await getProductById(id);
          const p = prodRes.data;

          setForm({
            title: p.title || "",
            description: p.description || "",
            category_id: p.category_id || "",
            brand_name: p.brand_name || "",
            sku: p.sku || "",
            barcode: p.barcode || "",
            care_type: p.care_type || "",
            concern_type: p.concern_type || "",
            dietary_type: p.dietary_type || "",
            flavour: p.flavour || "",
            size: p.size || "",
            net_weight: p.net_weight || "",
            serving_size: p.serving_size || "",
            servings_per_container: p.servings_per_container || "",
            price: p.price !== undefined ? p.price : "",
            discount_percent: p.discount_percent !== undefined ? p.discount_percent : "",
            stock: p.stock !== undefined ? p.stock : "",
            calories: p.calories || "",
            sugar: p.sugar || "",
            fat: p.fat || "",
            protein: p.protein || "",
            nutrition_per_100g: p.nutrition_per_100g || "",
            nutrition_per_serving: p.nutrition_per_serving || "",
            ingredients: p.ingredients || "",
            how_to_use: p.how_to_use || "",
            making_process: p.making_process || "",
            manufacturer_name: p.manufacturer_name || "",
            manufacturer_address: p.manufacturer_address || "",
            batch_number: p.batch_number || "",
            mfg_date: p.mfg_date ? new Date(p.mfg_date).toISOString().split("T")[0] : "",
            expiry_date: p.expiry_date ? new Date(p.expiry_date).toISOString().split("T")[0] : "",
            fssai_license: p.fssai_license || "",
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
        console.error("Error fetching initial product data:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchInitialData();
  }, [isEdit, id]);

  /* ================= HEALTH RATING CALCULATOR ================= */
  const calculateHealth = () => {
    if (Number(form.sugar) > 20 || Number(form.fat) > 20 || Number(form.calories) > 500) {
      return "Unhealthy";
    }
    return "Healthy";
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
      // Only require essential core fields
      if (!form.title || !form.price || form.stock === "" || !form.size) {
        alert("Please fill all required basic fields: Title, Base Price, Stock Quantity, and Net Quantity.");
        return;
      }

      setLoading(true);

      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (form[key] !== null && form[key] !== undefined && form[key] !== "") {
          formData.append(key, form[key]);
        }
      });

      formData.append("vendor_claimed_health", calculateHealth());

      if (isEdit && id) {
        await updateProduct(id, formData, token);
        alert("🎉 Product updated successfully!");
        navigate("/vendor/products");
      } else {
        await createProduct(formData, token);
        alert("🎉 Product added successfully!");
        navigate("/vendor/products");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error saving product details");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* 1. PAGE HEADER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-wider">
            {isEdit ? "Edit Product Listing" : "New Inventory Listing"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-primary mt-1">
            {isEdit ? "Update Product Details" : "Add Product to Store"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Fill in required fields and optional product specifications like Whey Protein facts, Brand, Batch, and Compliance details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/vendor/products")}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary hover:bg-primaryHover text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-50 inline-flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{loading ? "Saving..." : isEdit ? "Update Product" : "Publish Product"}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: ESSENTIAL PRODUCT INFORMATION */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-primary">
                1. Basic Information
              </h2>
              <p className="text-xs text-slate-500">Core listing title, brand name, category, and barcodes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Product Title <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                placeholder="e.g. Optimum Nutrition 100% Gold Standard Whey Protein Powder 1kg"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Brand Name <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                placeholder="e.g. Optimum Nutrition / MuscleBlaze / Himalaya"
                value={form.brand_name}
                onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Category <span className="text-slate-400 font-normal">(Optional)</span></label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">SKU / Product Code <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                placeholder="e.g. WHEY-CHO-1KG-001"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Barcode / EAN <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                placeholder="e.g. 8901234567890"
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Product Description <span className="text-slate-400 font-normal">(Optional)</span></label>
              <textarea
                rows={3}
                placeholder="Detailed description of benefits, formula, purity, and authenticity..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PRICING & INVENTORY */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-primary">
                2. Pricing, Discount & Inventory
              </h2>
              <p className="text-xs text-slate-500">Retail price, discount percentage, stock level, and net quantity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">MRP / Price (₹) <span className="text-red-500">*</span></label>
              <input
                required
                type="number"
                min="0"
                placeholder="e.g. 3999"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Discount (%) <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 15"
                value={form.discount_percent}
                onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Stock Quantity <span className="text-red-500">*</span></label>
              <input
                required
                type="number"
                min="0"
                placeholder="e.g. 50"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Net Quantity <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                placeholder="e.g. 1 kg / 500g / 1 L / 60 Capsules"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: FLAVOUR, SERVING SPECS & DIETARY TYPE */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-primary">
                3. Supplement Specs, Flavour & Dietary Type
              </h2>
              <p className="text-xs text-slate-500">Flavour, serving scoop size, servings per tub, and dietary classification</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Flavour <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                placeholder="e.g. Double Rich Chocolate / Vanilla / Unflavored"
                value={form.flavour}
                onChange={(e) => setForm({ ...form, flavour: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Serving Size <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                placeholder="e.g. 1 Scoop (30.4g)"
                value={form.serving_size}
                onChange={(e) => setForm({ ...form, serving_size: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Servings Per Container <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                placeholder="e.g. 33 Servings"
                value={form.servings_per_container}
                onChange={(e) => setForm({ ...form, servings_per_container: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
              />
            </div>
          </div>

          {/* Dietary Type Chips */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-slate-700 block">
              Dietary Classification <span className="text-slate-400 font-normal">(Select applicable)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((opt) => {
                const selected = form.dietary_type.split(",").map((s) => s.trim()).includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleChipToggle("dietary_type", opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      selected
                        ? "bg-purple-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5" />}
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 4: CARE TYPES & HEALTH CONCERNS (FOR WHEY PROTEIN & ALL CASES) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-primary">
                4. Care Type & Health Concerns (Fitness, Supplements & All Categories)
              </h2>
              <p className="text-xs text-slate-500">Select relevant care classifications and health targets</p>
            </div>
          </div>

          {/* Care Types */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Care Type / Category Segment</label>
            <div className="flex flex-wrap gap-2">
              {careOptions.map((opt) => {
                const selected = form.care_type.split(",").map((s) => s.trim()).includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleChipToggle("care_type", opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      selected
                        ? "bg-amber-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5" />}
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Health Concerns */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-slate-700 block">Health Concerns / Target Benefits</label>
            <div className="flex flex-wrap gap-2">
              {concernOptions.map((opt) => {
                const selected = form.concern_type.split(",").map((s) => s.trim()).includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleChipToggle("concern_type", opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      selected
                        ? "bg-amber-700 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5" />}
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 5: NUTRITIONAL FACTS */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-primary">
                5. Nutritional Facts & Macros
              </h2>
              <p className="text-xs text-slate-500">Macronutrients (Protein, Carbs, Fat) and structured nutrition table per 100g / per serving</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Protein (g) <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 24.0"
                value={form.protein}
                onChange={(e) => setForm({ ...form, protein: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Calories (kcal) <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="number"
                placeholder="e.g. 120"
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Total Fat (g) <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 1.0"
                value={form.fat}
                onChange={(e) => setForm({ ...form, fat: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Sugar (g) <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 1.5"
                value={form.sugar}
                onChange={(e) => setForm({ ...form, sugar: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Nutrition Facts Per Serving <span className="text-slate-400 font-normal">(Optional)</span></label>
              <textarea
                rows={2}
                placeholder="e.g. Energy: 120kcal, Protein: 24g, Carbs: 3g, BCAA: 5.5g, Glutamine: 4g"
                value={form.nutrition_per_serving}
                onChange={(e) => setForm({ ...form, nutrition_per_serving: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Nutrition Facts Per 100g <span className="text-slate-400 font-normal">(Optional)</span></label>
              <textarea
                rows={2}
                placeholder="e.g. Energy: 395kcal, Protein: 79g, Carbs: 9.8g, Fat: 3.3g"
                value={form.nutrition_per_100g}
                onChange={(e) => setForm({ ...form, nutrition_per_100g: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 6: MANUFACTURER, BATCH & COMPLIANCE DETAILS */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-primary">
                6. Manufacturer & Regulatory Compliance
              </h2>
              <p className="text-xs text-slate-500">Manufacturer address, Batch #, Mfg/Expiry dates, and FSSAI License</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Manufacturer Name <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                placeholder="e.g. Glanbia Performance Nutrition Ltd"
                value={form.manufacturer_name}
                onChange={(e) => setForm({ ...form, manufacturer_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">FSSAI License Number <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                placeholder="e.g. 10021022000123"
                value={form.fssai_license}
                onChange={(e) => setForm({ ...form, fssai_license: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-3">
              <label className="text-xs font-bold text-slate-700">Manufacturer Address <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                placeholder="Complete factory / packer address..."
                value={form.manufacturer_address}
                onChange={(e) => setForm({ ...form, manufacturer_address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Batch Number <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                placeholder="e.g. BATCH-2026-X99"
                value={form.batch_number}
                onChange={(e) => setForm({ ...form, batch_number: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Manufacturing Date <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="date"
                value={form.mfg_date}
                onChange={(e) => setForm({ ...form, mfg_date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Expiry Date / Best Before <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="date"
                value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-medium"
              />
            </div>
          </div>
        </div>

        {/* SECTION 7: INGREDIENTS & USAGE INSTRUCTIONS */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-primary">
                7. Ingredients & Usage Guide
              </h2>
              <p className="text-xs text-slate-500">Formula ingredients list and directions for use</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Full Ingredients List <span className="text-slate-400 font-normal">(Optional)</span></label>
              <textarea
                rows={2}
                placeholder="e.g. Whey Protein Isolate, Whey Protein Concentrate, Cocoa Powder, Natural Flavours, Lecithin, Sucralose..."
                value={form.ingredients}
                onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Directions / How to Use <span className="text-slate-400 font-normal">(Optional)</span></label>
              <textarea
                rows={2}
                placeholder="e.g. Mix 1 scoop (30g) with 200ml of cold water or milk. Shake well for 30 seconds..."
                value={form.how_to_use}
                onChange={(e) => setForm({ ...form, how_to_use: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 8: PRODUCT IMAGES */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-primary">
                8. Product Images & Label Scans
              </h2>
              <p className="text-xs text-slate-500">Primary product image and nutrition/ingredients label scan</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Primary Product Image */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Primary Product Packaging Image</label>
              
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-primary transition relative bg-slate-50/50">
                {productImgPreview ? (
                  <div className="relative group">
                    <img
                      src={productImgPreview}
                      alt="Product Preview"
                      className="h-44 mx-auto object-contain rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProductImgPreview(null);
                        setForm({ ...form, product_image: null });
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-6">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs font-bold text-primary block">Click to upload product image</span>
                    <span className="text-[11px] text-slate-400">PNG, JPG, WEBP up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Ingredients Label Image */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Nutrition Facts / Ingredients Label Scan <span className="text-slate-400 font-normal">(Optional)</span></label>
              
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-primary transition relative bg-slate-50/50">
                {ingredientsImgPreview ? (
                  <div className="relative group">
                    <img
                      src={ingredientsImgPreview}
                      alt="Label Preview"
                      className="h-44 mx-auto object-contain rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIngredientsImgPreview(null);
                        setForm({ ...form, ingredients_image: null });
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-6">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs font-bold text-primary block">Click to upload label scan</span>
                    <span className="text-[11px] text-slate-400">PNG, JPG, WEBP up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIngredientsImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SUBMIT BAR */}
        <div className="pt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/vendor/products")}
            className="px-6 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm transition"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primaryHover text-white px-8 py-3 rounded-xl text-base font-extrabold shadow-lg transition active:scale-95 disabled:opacity-50 inline-flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>{loading ? "Saving Product..." : isEdit ? "Update Product Listing" : "Publish Product Listing"}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
