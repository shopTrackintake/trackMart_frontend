import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import api from "../../services/api";
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowLeft,
  RefreshCw,
  FileText,
  Package,
  Layers,
  HelpCircle,
  Eye,
  Info,
  Check,
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function VendorBulkUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // States
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState([]);
  const [validationIssues, setValidationIssues] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [activeResultTab, setActiveResultTab] = useState("all");
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  // Sample data definition for fallback client-side template creation
  const TEMPLATE_HEADERS = [
    "Product Title * [REQUIRED]",
    "Price (₹) * [REQUIRED]",
    "Stock Quantity * [REQUIRED]",
    "Size / Net Quantity * [REQUIRED]",
    "Category Name",
    "Discount Percent (%)",
    "Brand Name",
    "SKU Code",
    "Barcode / EAN",
    "Main Product Image URL",
    "Ingredients Packaging Image URL",
    "Ingredients",
    "Dietary Type",
    "Flavour",
    "Care Type",
    "Concern Type",
    "Calories (kcal)",
    "Sugar (g)",
    "Fat (g)",
    "Protein (g)",
    "Serving Size",
    "Servings Per Container",
    "Net Weight",
    "Product Description",
    "How To Use / Directions",
    "Manufacturing Process",
    "Manufacturer Name",
    "Manufacturer Address",
    "FSSAI License Number",
    "Batch Number",
    "Manufacturing Date (YYYY-MM-DD)",
    "Expiry Date (YYYY-MM-DD)",
    "Nutrition Facts per 100g",
    "Nutrition Facts per Serving"
  ];

  const SAMPLE_ROWS = [
    {
      "Product Title * [REQUIRED]": "Organic Himalayan Raw Forest Honey",
      "Price (₹) * [REQUIRED]": 499,
      "Stock Quantity * [REQUIRED]": 75,
      "Size / Net Quantity * [REQUIRED]": "500g",
      "Category Name": "Organic Foods",
      "Discount Percent (%)": 10,
      "Brand Name": "NaturePure Organic",
      "SKU Code": "NPO-HONEY-500",
      "Barcode / EAN": "8901234567890",
      "Main Product Image URL": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
      "Ingredients Packaging Image URL": "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=600&q=80",
      "Ingredients": "100% Pure Raw Multi-Floral Forest Honey, No Added Sugar, No Preservatives",
      "Dietary Type": "Vegetarian",
      "Flavour": "Wildflower",
      "Care Type": "Immunity & Wellness Care",
      "Concern Type": "Immunity Support",
      "Calories (kcal)": 320,
      "Sugar (g)": 16,
      "Fat (g)": 0,
      "Protein (g)": 0.5,
      "Serving Size": "1 Tablespoon (15g)",
      "Servings Per Container": "33",
      "Net Weight": "500g",
      "Product Description": "Unprocessed, naturally crystallized organic raw forest honey harvested ethically from Himalayan wild flora.",
      "How To Use / Directions": "Take 1 tablespoon daily morning with warm water or mix with herbal tea.",
      "Manufacturing Process": "Cold filtered, unpasteurized to preserve natural enzymes, bee pollen, and antioxidants.",
      "Manufacturer Name": "NaturePure Organics Ltd",
      "Manufacturer Address": "Plot 12, Valley Industrial Estate, Dehradun, Uttarakhand - 248001",
      "FSSAI License Number": "10022011000845",
      "Batch Number": "HMY-2026-OCT",
      "Manufacturing Date (YYYY-MM-DD)": "2026-10-01",
      "Expiry Date (YYYY-MM-DD)": "2028-10-01",
      "Nutrition Facts per 100g": "Energy: 320 kcal, Carbs: 80g, Natural Sugars: 78g, Protein: 0.5g",
      "Nutrition Facts per Serving": "Energy: 48 kcal, Carbs: 12g, Natural Sugars: 11.7g"
    },
    {
      "Product Title * [REQUIRED]": "California Roasted Almonds (Lightly Salted)",
      "Price (₹) * [REQUIRED]": 349,
      "Stock Quantity * [REQUIRED]": 120,
      "Size / Net Quantity * [REQUIRED]": "250g",
      "Category Name": "Healthy Snacks",
      "Discount Percent (%)": 15,
      "Brand Name": "NutriCrunch",
      "SKU Code": "NC-ALM-250",
      "Barcode / EAN": "8909876543210",
      "Main Product Image URL": "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80",
      "Ingredients Packaging Image URL": "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80",
      "Ingredients": "California Supreme Almonds (99%), Himalayan Pink Rock Salt (1%)",
      "Dietary Type": "Vegan",
      "Flavour": "Roasted & Salted",
      "Care Type": "Heart & Cholesterol Care",
      "Concern Type": "General Wellbeing",
      "Calories (kcal)": 579,
      "Sugar (g)": 4.4,
      "Fat (g)": 49.9,
      "Protein (g)": 21.2,
      "Serving Size": "28g (approx. 23 nuts)",
      "Servings Per Container": "9",
      "Net Weight": "250g",
      "Product Description": "Crispy dry-roasted California supreme almonds seasoned with authentic Himalayan pink salt.",
      "How To Use / Directions": "Ready to eat nutritious crunch between meals or as pre-workout energy.",
      "Manufacturing Process": "Slow dry roasted without oil and nitrogen flushed for lasting crunchiness.",
      "Manufacturer Name": "NutriCrunch Foods Pvt Ltd",
      "Manufacturer Address": "GIDC Naroda, Ahmedabad, Gujarat - 382330",
      "FSSAI License Number": "10019022000512",
      "Batch Number": "ALM-2026-B1",
      "Manufacturing Date (YYYY-MM-DD)": "2026-09-15",
      "Expiry Date (YYYY-MM-DD)": "2027-03-15",
      "Nutrition Facts per 100g": "Energy: 579 kcal, Dietary Fiber: 12.5g, Protein: 21.2g, Healthy Fats: 49.9g",
      "Nutrition Facts per Serving": "Energy: 162 kcal, Protein: 6g, Fiber: 3.5g"
    },
    {
      "Product Title * [REQUIRED]": "Plant Protein Isolate Powder (Belgian Chocolate)",
      "Price (₹) * [REQUIRED]": 1899,
      "Stock Quantity * [REQUIRED]": 40,
      "Size / Net Quantity * [REQUIRED]": "1kg",
      "Category Name": "Protein & Supplements",
      "Discount Percent (%)": 20,
      "Brand Name": "ProFit Fuel",
      "SKU Code": "PFF-PLANT-1KG",
      "Barcode / EAN": "8905647382910",
      "Main Product Image URL": "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=600&q=80",
      "Ingredients Packaging Image URL": "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=600&q=80",
      "Ingredients": "Fermented Pea Protein Isolate, Organic Brown Rice Protein, Cocoa Powder, Stevia Leaf Extract, Digestive Enzymes (Papain, Bromelain)",
      "Dietary Type": "Vegan",
      "Flavour": "Belgian Chocolate",
      "Care Type": "Muscle & Fitness Care",
      "Concern Type": "Muscle Building & Recovery",
      "Calories (kcal)": 380,
      "Sugar (g)": 0.8,
      "Fat (g)": 3.2,
      "Protein (g)": 78,
      "Serving Size": "1 Scoop (33g)",
      "Servings Per Container": "30",
      "Net Weight": "1000g",
      "Product Description": "100% plant-based clean protein delivering 25g protein per scoop with complete amino acid profile.",
      "How To Use / Directions": "Shake 1 scoop with 300ml cold water or plant milk within 30 minutes post workout.",
      "Manufacturing Process": "Low-temperature water extraction, non-GMO, micro-filtered and lab-tested for heavy metals.",
      "Manufacturer Name": "ProFit Nutrition Labs",
      "Manufacturer Address": "Tech Bio Park, Electronic City, Bengaluru - 560100",
      "FSSAI License Number": "10018043000721",
      "Batch Number": "PFF-2026-CHOC",
      "Manufacturing Date (YYYY-MM-DD)": "2026-10-10",
      "Expiry Date (YYYY-MM-DD)": "2028-04-10",
      "Nutrition Facts per 100g": "Energy: 380 kcal, Protein: 78g, Carbs: 8.5g, BCAA: 15.2g",
      "Nutrition Facts per Serving": "Energy: 125 kcal, Protein: 25.7g, BCAA: 5g, Sugar: 0.2g"
    }
  ];

  /* 1. DOWNLOAD PREFILLED EXCEL TEMPLATE */
  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);
      // Try downloading from backend endpoint first
      const res = await api.get("/products/template/excel", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "trackmart_vendor_products_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Backend template route unavailable, generating client-side:", err);
      // Fallback: Generate directly in browser via SheetJS
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(SAMPLE_ROWS, { header: TEMPLATE_HEADERS });
      worksheet["!cols"] = TEMPLATE_HEADERS.map((col) => ({ wch: Math.max(col.length + 4, 18) }));
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products Upload Template");

      // Guidelines Sheet
      const guideData = [
        { Field: "Product Title * [REQUIRED]", Requirement: "MANDATORY", Description: "Full product name (e.g. Organic Raw Honey 500g)" },
        { Field: "Price (₹) * [REQUIRED]", Requirement: "MANDATORY", Description: "Selling price in INR numbers (e.g. 499)" },
        { Field: "Stock Quantity * [REQUIRED]", Requirement: "MANDATORY", Description: "Available units in stock (e.g. 50)" },
        { Field: "Size / Net Quantity * [REQUIRED]", Requirement: "MANDATORY", Description: "Net unit (e.g. 500g, 1L, 100 Capsules)" },
        { Field: "Category Name", Requirement: "RECOMMENDED", Description: "Pick from: Healthy Snacks, Organic Foods, Beverages, Protein & Supplements, Breakfast Essentials, Diet Foods, Fitness Foods, Kids Nutrition, Low Sugar Products, Packaged Foods" },
        { Field: "Discount Percent (%)", Requirement: "OPTIONAL", Description: "Discount percentage (0 to 90)" },
        { Field: "Main Product Image URL", Requirement: "RECOMMENDED", Description: "Direct public image URL (Cloudinary, Imgur, or cloud storage)" },
        { Field: "Ingredients Packaging Image URL", Requirement: "OPTIONAL", Description: "Direct public image URL to packaging/ingredients label" },
        { Field: "Ingredients", Requirement: "RECOMMENDED", Description: "Comma-separated list or description of ingredients" },
        { Field: "Dietary Type", Requirement: "OPTIONAL", Description: "Vegetarian, Vegan, Gluten-Free, Keto-Friendly, Organic, Sugar-Free, etc." },
        { Field: "FSSAI License Number", Requirement: "RECOMMENDED", Description: "14-digit FSSAI license number" }
      ];
      const guideSheet = XLSX.utils.json_to_sheet(guideData);
      guideSheet["!cols"] = [{ wch: 32 }, { wch: 16 }, { wch: 60 }];
      XLSX.utils.book_append_sheet(workbook, guideSheet, "Guidelines & Reference");

      XLSX.writeFile(workbook, "trackmart_vendor_products_template.xlsx");
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  /* Helper to extract value case-insensitively */
  const extractVal = (row, ...keys) => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") {
        return String(row[k]).trim();
      }
      const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, "");
      for (const rk of Object.keys(row)) {
        if (rk.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanK) {
          if (row[rk] !== undefined && row[rk] !== null && String(row[rk]).trim() !== "") {
            return String(row[rk]).trim();
          }
        }
      }
    }
    return "";
  };

  /* 2. HANDLE FILE SELECTION & CLIENT-SIDE VALIDATION PREVIEW */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processSelectedFile(selectedFile);
  };

  const processSelectedFile = (selectedFile) => {
    setFile(selectedFile);
    setResults(null);
    setParsing(true);
    setValidationIssues([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!rawJson.length) {
          setValidationIssues([{ row: 0, error: "The uploaded sheet is empty. Please ensure it contains data." }]);
          setParsedRows([]);
          setParsing(false);
          return;
        }

        const issues = [];
        const normalized = [];

        rawJson.forEach((row, idx) => {
          const rowNum = idx + 2;
          const title = extractVal(row, "Product Title * [REQUIRED]", "Product Title", "Title", "Product Name", "title");
          const rawPrice = extractVal(row, "Price (₹) * [REQUIRED]", "Price (₹)", "Price", "price");
          const rawStock = extractVal(row, "Stock Quantity * [REQUIRED]", "Stock Quantity", "Stock", "stock");
          const size = extractVal(row, "Size / Net Quantity * [REQUIRED]", "Size / Net Quantity", "Size", "size");

          // Skip completely empty rows
          if (!title && !rawPrice && !rawStock && !size) return;

          const rowErrors = [];
          if (!title) rowErrors.push("Product Title is missing");

          const cleanPrice = String(rawPrice).replace(/[₹,\s]/g, "");
          if (!cleanPrice || isNaN(Number(cleanPrice)) || Number(cleanPrice) <= 0) {
            rowErrors.push(`Invalid price: "${rawPrice}" (must be > ₹0)`);
          }

          const cleanStock = String(rawStock).replace(/[,\s]/g, "");
          if (cleanStock === "" || isNaN(Number(cleanStock)) || Number(cleanStock) < 0) {
            rowErrors.push(`Invalid stock: "${rawStock}" (must be ≥ 0)`);
          }

          if (!size) rowErrors.push("Size / Net Quantity is missing");

          if (rowErrors.length > 0) {
            issues.push({ row: rowNum, title: title || "(Untitled)", errors: rowErrors });
          }

          normalized.push({
            rowNum,
            title: title || "(Missing Title)",
            price: rawPrice || "0",
            stock: rawStock || "0",
            size: size || "N/A",
            category: extractVal(row, "Category Name", "Category", "category_name") || "General",
            brand: extractVal(row, "Brand Name", "Brand", "brand_name") || "—",
            sku: extractVal(row, "SKU Code", "SKU", "sku") || "—",
            imageUrl: extractVal(row, "Main Product Image URL", "Product Image URL", "Image URL", "image_url") || "",
            hasErrors: rowErrors.length > 0,
            errors: rowErrors
          });
        });

        setParsedRows(normalized);
        setValidationIssues(issues);
      } catch (err) {
        console.error("Error parsing Excel:", err);
        setValidationIssues([{ row: 0, error: "Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls document." }]);
      } finally {
        setParsing(false);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  /* 3. SUBMIT EXCEL FILE TO BACKEND FOR BULK CREATION */
  const handleSubmitUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress(10);

      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress(40);
      const res = await api.post("/products/bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setUploadProgress(100);
      setResults(res.data);
    } catch (err) {
      console.error("Bulk upload failure:", err);
      alert(err.response?.data?.message || "Failed to process bulk upload. Please check your data and retry.");
    } finally {
      setUploading(false);
    }
  };

  /* 4. EXPORT RESULTS REPORT TO SPREADSHEET */
  const handleExportResults = () => {
    if (!results?.results) return;
    const reportData = results.results.map((r) => ({
      "Row in File": r.row,
      "Product Title": r.title,
      Status: r.status === "success" ? "SUCCESS" : "FAILED",
      "Product ID": r.productId || "—",
      "Price (₹)": r.price || "—",
      "Stock Added": r.stock || "—",
      Details: r.message || r.error || "—"
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Import Results");
    XLSX.writeFile(workbook, `trackmart_import_results_${Date.now()}.xlsx`);
  };

  const filteredResults = results?.results?.filter((r) => {
    if (activeResultTab === "success") return r.status === "success";
    if (activeResultTab === "failed") return r.status === "failed";
    return true;
  }) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. TOP BREADCRUMB & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1.5">
            <Link to="/vendor" className="hover:text-primary transition">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to="/vendor/products" className="hover:text-primary transition">My Products</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-bold">Bulk Excel Upload</span>
          </nav>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Bulk Product Upload <span className="text-emerald-600 font-mono text-xl sm:text-2xl">.xlsx</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Download the official template, fill in your catalog details, and upload in one go.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/vendor/products")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </button>
        </div>
      </div>

      {/* 2. TWO-COLUMN WORKFLOW: STEP 1 (TEMPLATE) & STEP 2 (UPLOAD ZONE) */}
      {!results && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* STEP 1: DOWNLOAD PREFILLED TEMPLATE */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-slate-900 text-base">Download Excel Template</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use our pre-configured spreadsheet containing all product attributes, guidelines, and sample entries.
              </p>

              {/* Column Legend */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Info className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Key Column Format Guide</span>
                </div>

                <div className="space-y-2 text-[11px] text-slate-600">
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 shrink-0">
                      * [REQUIRED]
                    </span>
                    <span>
                      <strong>Title, Price (₹), Stock, Size / Net Quantity</strong> must not be left blank.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-sky-100 text-sky-800 shrink-0">
                      IMAGES
                    </span>
                    <span>
                      Include direct image links in <strong>Main Product Image URL</strong> and <strong>Ingredients Image URL</strong>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                      NUTRITION
                    </span>
                    <span>
                      Columns for <strong>Ingredients, Calories, Sugar, Fat, Protein, FSSAI License, Expiry Date</strong>.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadTemplate}
              disabled={isDownloadingTemplate}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Download className={`w-4 h-4 text-emerald-400 ${isDownloadingTemplate ? "animate-bounce" : ""}`} />
              <span>{isDownloadingTemplate ? "Generating Template..." : "Download Excel Template (.xlsx)"}</span>
            </button>
          </div>

          {/* STEP 2: UPLOAD & PREVIEW */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-slate-900 text-base">Upload Completed Spreadsheet</h3>
            </div>

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  processSelectedFile(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/30 rounded-2xl p-8 text-center cursor-pointer transition group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-12 h-12 mx-auto rounded-2xl bg-white border border-slate-200 group-hover:border-emerald-400 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition shadow-2xs mb-3">
                <Upload className="w-6 h-6" />
              </div>

              {file ? (
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 text-sm">{file.name}</p>
                  <p className="text-xs text-slate-500 font-mono">
                    {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} items detected
                  </p>
                  <span className="inline-block mt-2 text-xs text-emerald-600 font-bold underline">
                    Click to choose a different file
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 text-sm">
                    Drag and drop your <span className="text-emerald-600 font-mono">.xlsx</span> file here
                  </p>
                  <p className="text-xs text-slate-500">or click to browse from your device</p>
                  <span className="inline-block mt-2 text-[11px] font-semibold text-slate-400">
                    Supports Microsoft Excel (.xlsx, .xls) up to 15MB
                  </span>
                </div>
              )}
            </div>

            {/* Validation Notice or Warnings */}
            {parsing && (
              <div className="p-4 rounded-2xl bg-slate-100 flex items-center justify-center gap-2 text-xs text-slate-600 font-semibold animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Reading &amp; validating spreadsheet data...</span>
              </div>
            )}

            {validationIssues.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Validation Warning: {validationIssues.length} row(s) contain issues</span>
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] text-amber-800 pl-6 list-disc">
                  {validationIssues.slice(0, 5).map((iss, i) => (
                    <div key={i}>
                      Row {iss.row} ({iss.title}): {iss.errors ? iss.errors.join(", ") : iss.error}
                    </div>
                  ))}
                  {validationIssues.length > 5 && (
                    <div className="font-bold text-amber-900">
                      ...and {validationIssues.length - 5} more rows with warnings.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            {parsedRows.length > 0 && (
              <button
                onClick={handleSubmitUpload}
                disabled={uploading}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition shadow-sm active:scale-95 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing &amp; Creating {parsedRows.length} Products...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Upload &amp; Add {parsedRows.length} Products to Catalog</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. PRE-UPLOAD PARSED DATA PREVIEW */}
      {!results && parsedRows.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <span>Pre-Upload Spreadsheet Preview ({parsedRows.length} Products Detected)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review your items before adding them into your live store catalog.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {parsedRows.filter(p => !p.hasErrors).length} Valid • {parsedRows.filter(p => p.hasErrors).length} with issues
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Row #</th>
                  <th className="px-4 py-3">Product Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Pre-Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {parsedRows.slice(0, 15).map((row) => (
                  <tr key={row.rowNum} className={row.hasErrors ? "bg-rose-50/40" : "hover:bg-slate-50/60"}>
                    <td className="px-4 py-3 font-mono font-bold text-slate-500">#{row.rowNum}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        {row.imageUrl ? (
                          <img
                            src={row.imageUrl}
                            alt=""
                            className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        ) : null}
                        <span className="truncate max-w-[220px]" title={row.title}>{row.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.category}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">₹{row.price}</td>
                    <td className="px-4 py-3 font-mono">{row.stock}</td>
                    <td className="px-4 py-3 text-slate-600">{row.size}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{row.sku}</td>
                    <td className="px-4 py-3">
                      {row.hasErrors ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800" title={row.errors.join("; ")}>
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>{row.errors[0]}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Ready</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedRows.length > 15 && (
            <p className="text-[11px] text-slate-400 text-center font-medium">
              Showing first 15 of {parsedRows.length} total detected items. All rows will be processed.
            </p>
          )}
        </div>
      )}

      {/* 4. POST-UPLOAD RESULTS CONSOLE */}
      {results && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Processed */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
              <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                Total Products Processed
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {results.summary?.total || 0}
              </div>
              <div className="text-slate-500 text-xs mt-0.5 font-medium">
                Items parsed from your spreadsheet
              </div>
            </div>

            {/* Succeeded */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-200 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-emerald-800 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Successfully Added</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                  LIVE
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-900 mt-1">
                {results.summary?.success || 0}
              </div>
              <div className="text-emerald-700 text-xs mt-0.5 font-medium">
                Active in your store catalog
              </div>
            </div>

            {/* Failed */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
              <div className="text-rose-600 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <span>Failed / Skipped</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {results.summary?.failed || 0}
              </div>
              <div className="text-slate-500 text-xs mt-0.5 font-medium">
                Required fixes or were duplicate titles
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5">
              {[
                { id: "all", label: `All (${results.summary?.total || 0})` },
                { id: "success", label: `Success (${results.summary?.success || 0})` },
                { id: "failed", label: `Failed (${results.summary?.failed || 0})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveResultTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeResultTab === tab.id
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportResults}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
                title="Download spreadsheet report of these results"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Results (.xlsx)</span>
              </button>

              <button
                onClick={() => {
                  setResults(null);
                  setParsedRows([]);
                  setFile(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Another File</span>
              </button>

              <button
                onClick={() => navigate("/vendor/products")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition shadow-xs active:scale-95"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Go to Store Catalog</span>
              </button>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Row in File</th>
                    <th className="px-5 py-3.5">Product Title</th>
                    <th className="px-5 py-3.5">Price &amp; Stock</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Result Status</th>
                    <th className="px-5 py-3.5">Audit Log / Details</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredResults.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-4 whitespace-nowrap font-mono font-bold text-slate-500">
                        Row #{r.row}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900 text-sm">{r.title}</p>
                        {r.productId && (
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            ID: #{String(r.productId).slice(0, 8)}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {r.price ? (
                          <>
                            <span className="font-black text-slate-900">₹{r.price}</span>
                            <span className="text-slate-400 text-[11px] ml-1.5">
                              ({r.stock} in stock)
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                        {r.category || "—"}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {r.status === "success" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Added</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Failed</span>
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs">
                        {r.status === "success" ? (
                          <p className="text-emerald-700 font-medium">
                            {r.message || "Product created successfully"}
                          </p>
                        ) : (
                          <p className="text-rose-600 font-medium leading-relaxed">
                            {r.error || "Failed to insert product record"}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
