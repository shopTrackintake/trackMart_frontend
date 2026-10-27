import { useState, useRef, useMemo, useEffect } from "react";
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
  Sparkles,
  Image as ImageIcon,
  Plus,
  Edit3,
  Trash2,
  X,
  Search,
  ExternalLink,
  SlidersHorizontal,
  Camera,
  Tag,
  IndianRupee,
  Calendar,
  Building,
  Activity,
  Flame,
  Scale,
  ShieldCheck,
  Percent
} from "lucide-react";

export default function VendorBulkUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const imagesInputRef = useRef(null);
  const singleRowImageInputRef = useRef(null);

  // Core File States
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState([]);
  const [validationIssues, setValidationIssues] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [activeResultTab, setActiveResultTab] = useState("all");
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);

  // Accompanying Images States
  const [attachedImages, setAttachedImages] = useState([]);
  const [targetRowForImage, setTargetRowForImage] = useState(null);

  // Edit Whole Form Modal States
  const [editingRow, setEditingRow] = useState(null);
  const [modalActiveTab, setModalActiveTab] = useState("essentials");
  const [editFormData, setEditFormData] = useState({
    title: "",
    price: "",
    discount_percent: "",
    stock: "",
    size: "",
    net_weight: "",
    category: "",
    brand_name: "",
    sku: "",
    barcode: "",
    care_type: "",
    concern_type: "",
    dietary_type: "",
    flavour: "",
    calories: "",
    sugar: "",
    fat: "",
    protein: "",
    serving_size: "",
    servings_per_container: "",
    nutrition_per_100g: "",
    nutrition_per_serving: "",
    description: "",
    how_to_use: "",
    making_process: "",
    ingredients: "",
    manufacturer_name: "",
    manufacturer_address: "",
    fssai_license: "",
    batch_number: "",
    mfg_date: "",
    expiry_date: "",
    localPreviewUrl: "",
    imageFilename: "",
    localImageFile: null,
    imageUrl: "",
    localIngredientsPreviewUrl: "",
    ingredientsImageFilename: "",
    localIngredientsImageFile: null,
    ingredientsImageUrl: ""
  });

  // Preview Table Search & Filter States
  const [previewSearch, setPreviewSearch] = useState("");
  const [previewFilter, setPreviewFilter] = useState("all");

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

  // Fetch live categories for dropdown in modal
  useEffect(() => {
    api.get("/categories")
      .then((res) => {
        setCategoriesList(res.data || []);
      })
      .catch((err) => {
        console.warn("Could not fetch categories list:", err);
      });
  }, []);

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
      "Main Product Image URL": "honey.jpg",
      "Ingredients Packaging Image URL": "honey_ingredients.jpg",
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
      "Main Product Image URL": "almonds.jpg",
      "Ingredients Packaging Image URL": "almonds_ingredients.jpg",
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
    }
  ];

  /* 1. DOWNLOAD PREFILLED EXCEL TEMPLATE */
  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);
      const response = await api.get("/products/template/download", {
        responseType: "blob"
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", "trackmart_vendor_products_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.warn("Server template download failed, generating client fallback template:", err);
      generateClientFallbackTemplate();
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const generateClientFallbackTemplate = () => {
    const workbook = XLSX.utils.book_new();
    const dataSheet = XLSX.utils.json_to_sheet(SAMPLE_ROWS, { header: TEMPLATE_HEADERS });
    dataSheet["!cols"] = TEMPLATE_HEADERS.map((h) => ({
      wch: Math.max(h.length + 4, 18)
    }));
    XLSX.utils.book_append_sheet(workbook, dataSheet, "Products Catalog");

    const guideSheet = XLSX.utils.json_to_sheet([
      {
        Field: "Product Title * [REQUIRED]",
        Requirement: "MANDATORY",
        Description: "Official product name displayed to buyers"
      },
      {
        Field: "Price (₹) * [REQUIRED]",
        Requirement: "MANDATORY",
        Description: "Selling price in INR (e.g. 499)"
      },
      {
        Field: "Stock Quantity * [REQUIRED]",
        Requirement: "MANDATORY",
        Description: "Available units in inventory (e.g. 100)"
      },
      {
        Field: "Size / Net Quantity * [REQUIRED]",
        Requirement: "MANDATORY",
        Description: "Package size with unit (e.g. 500g, 1L, 100 tablets)"
      },
      {
        Field: "Main Product Image URL",
        Requirement: "RECOMMENDED",
        Description: "HTTPS web link OR local photo filename (e.g. honey.jpg or SKU code) when uploading photo files alongside spreadsheet"
      },
      {
        Field: "Ingredients Packaging Image URL",
        Requirement: "RECOMMENDED",
        Description: "HTTPS web link OR local photo filename (e.g. honey_ingredients.jpg or SKU_ingredients.jpg)"
      }
    ]);
    XLSX.utils.book_append_sheet(workbook, guideSheet, "Guidelines");
    XLSX.writeFile(workbook, "trackmart_vendor_products_template.xlsx");
  };

  const extractVal = (row, ...keys) => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") {
        return String(row[k]).trim();
      }
    }
    return "";
  };

  /* Helper to auto-match images to parsed rows for BOTH Main and Ingredients photos */
  const matchImagesWithRows = (rows, images) => {
    if (!images || images.length === 0) return rows;

    const imgByName = new Map();
    const imgByBase = new Map();

    images.forEach((img) => {
      imgByName.set(img.name.toLowerCase().trim(), img);
      imgByBase.set(img.baseName.toLowerCase().trim(), img);
    });

    return rows.map((row) => {
      let updatedRow = { ...row };

      // 1. MATCH MAIN PRODUCT PHOTO (unless manually assigned)
      if (!row.isManuallyAssigned || !row.localPreviewUrl) {
        let matchedMain = null;

        if (row.imageUrl) {
          const cleanImg = row.imageUrl.toLowerCase().trim();
          const cleanBase = cleanImg.replace(/\.[^/.]+$/, "");
          if (imgByName.has(cleanImg)) matchedMain = imgByName.get(cleanImg);
          else if (imgByBase.has(cleanBase)) matchedMain = imgByBase.get(cleanBase);
        }

        if (!matchedMain && row.sku && row.sku !== "—") {
          const cleanSku = row.sku.toLowerCase().trim();
          if (imgByBase.has(cleanSku)) matchedMain = imgByBase.get(cleanSku);
          else if (imgByName.has(cleanSku)) matchedMain = imgByName.get(cleanSku);
        }

        if (!matchedMain && row.barcode && row.barcode !== "—") {
          const cleanBar = row.barcode.toLowerCase().trim();
          if (imgByBase.has(cleanBar)) matchedMain = imgByBase.get(cleanBar);
        }

        if (!matchedMain && row.title) {
          const sanitizedTitle = row.title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").trim();
          if (imgByBase.has(sanitizedTitle)) matchedMain = imgByBase.get(sanitizedTitle);
        }

        if (matchedMain) {
          updatedRow.localImageFile = matchedMain.file;
          updatedRow.localPreviewUrl = matchedMain.previewUrl;
          updatedRow.imageFilename = matchedMain.name;
        }
      }

      // 2. MATCH INGREDIENTS / PACKAGING LABEL PHOTO (unless manually assigned)
      if (!row.isIngredientsManuallyAssigned || !row.localIngredientsPreviewUrl) {
        let matchedIng = null;

        if (row.ingredientsImageUrl) {
          const cleanIngImg = row.ingredientsImageUrl.toLowerCase().trim();
          const cleanIngBase = cleanIngImg.replace(/\.[^/.]+$/, "");
          if (imgByName.has(cleanIngImg)) matchedIng = imgByName.get(cleanIngImg);
          else if (imgByBase.has(cleanIngBase)) matchedIng = imgByBase.get(cleanIngBase);
        }

        if (!matchedIng && row.sku && row.sku !== "—") {
          const cleanSku = row.sku.toLowerCase().trim();
          const candidates = [
            `${cleanSku}_ingredients`,
            `${cleanSku}-ingredients`,
            `${cleanSku}_label`,
            `${cleanSku}-label`,
            `${cleanSku}_back`,
            `${cleanSku}-back`,
            `${cleanSku}_nutrition`
          ];
          for (const cand of candidates) {
            if (imgByBase.has(cand)) {
              matchedIng = imgByBase.get(cand);
              break;
            }
          }
        }

        if (!matchedIng && row.title) {
          const sanitizedTitle = row.title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").trim();
          const candidates = [
            `${sanitizedTitle}_ingredients`,
            `${sanitizedTitle}-ingredients`,
            `${sanitizedTitle}_label`,
            `${sanitizedTitle}-label`,
            `${sanitizedTitle}_back`
          ];
          for (const cand of candidates) {
            if (imgByBase.has(cand)) {
              matchedIng = imgByBase.get(cand);
              break;
            }
          }
        }

        if (matchedIng) {
          updatedRow.localIngredientsImageFile = matchedIng.file;
          updatedRow.localIngredientsPreviewUrl = matchedIng.previewUrl;
          updatedRow.ingredientsImageFilename = matchedIng.name;
        }
      }

      return updatedRow;
    });
  };

  /* 2. HANDLE EXCEL SPREADSHEET SELECTION */
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

          const description = extractVal(row, "Product Description", "Description", "description");
          const how_to_use = extractVal(row, "How To Use / Directions", "How To Use", "how_to_use");
          const making_process = extractVal(row, "Manufacturing Process", "Making Process", "making_process");
          const ingredients = extractVal(row, "Ingredients", "Ingredient List", "ingredients");
          const sku = extractVal(row, "SKU Code", "SKU", "sku") || "—";
          const barcode = extractVal(row, "Barcode / EAN", "Barcode", "barcode") || "—";
          const brand_name = extractVal(row, "Brand Name", "Brand", "brand_name") || "—";
          const category = extractVal(row, "Category Name", "Category", "category_name") || "General";
          const discount_percent = extractVal(row, "Discount Percent (%)", "Discount %", "discount_percent", "discount");
          const dietary_type = extractVal(row, "Dietary Type", "dietary_type", "Dietary");
          const flavour = extractVal(row, "Flavour", "Flavor", "flavour", "flavor");
          const care_type = extractVal(row, "Care Type", "care_type");
          const concern_type = extractVal(row, "Concern Type", "concern_type");
          const calories = extractVal(row, "Calories (kcal)", "Calories", "calories");
          const sugar = extractVal(row, "Sugar (g)", "Sugar", "sugar");
          const fat = extractVal(row, "Fat (g)", "Fat", "fat");
          const protein = extractVal(row, "Protein (g)", "Protein", "protein");
          const serving_size = extractVal(row, "Serving Size", "serving_size");
          const servings_per_container = extractVal(row, "Servings Per Container", "servings_per_container");
          const net_weight = extractVal(row, "Net Weight", "net_weight") || size;
          const manufacturer_name = extractVal(row, "Manufacturer Name", "manufacturer_name");
          const manufacturer_address = extractVal(row, "Manufacturer Address", "manufacturer_address");
          const fssai_license = extractVal(row, "FSSAI License Number", "FSSAI License", "fssai_license");
          const batch_number = extractVal(row, "Batch Number", "batch_number");
          const mfg_date = extractVal(row, "Manufacturing Date (YYYY-MM-DD)", "Mfg Date", "mfg_date");
          const expiry_date = extractVal(row, "Expiry Date (YYYY-MM-DD)", "Expiry Date", "expiry_date");
          const nutrition_per_100g = extractVal(row, "Nutrition Facts per 100g", "nutrition_per_100g");
          const nutrition_per_serving = extractVal(row, "Nutrition Facts per Serving", "nutrition_per_serving");

          const rawImgUrl = extractVal(row, "Main Product Image URL", "Product Image URL", "Image URL", "image_url");
          const rawIngImgUrl = extractVal(row, "Ingredients Packaging Image URL", "Ingredients Image URL", "ingredients_image_url");

          normalized.push({
            rowNum,
            title: title || "(Missing Title)",
            price: cleanPrice || "0",
            discount_percent: discount_percent || "0",
            stock: cleanStock || "0",
            size: size || "N/A",
            net_weight,
            category,
            brand_name,
            sku,
            barcode,
            dietary_type,
            flavour,
            care_type,
            concern_type,
            calories,
            sugar,
            fat,
            protein,
            serving_size,
            servings_per_container,
            nutrition_per_100g,
            nutrition_per_serving,
            description,
            how_to_use,
            making_process,
            ingredients,
            manufacturer_name,
            manufacturer_address,
            fssai_license,
            batch_number,
            mfg_date,
            expiry_date,
            imageUrl: rawImgUrl,
            ingredientsImageUrl: rawIngImgUrl,
            // Front Photo
            localImageFile: null,
            localPreviewUrl: rawImgUrl && (rawImgUrl.startsWith("http://") || rawImgUrl.startsWith("https://")) ? rawImgUrl : "",
            imageFilename: "",
            isManuallyAssigned: false,
            // Ingredients Photo
            localIngredientsImageFile: null,
            localIngredientsPreviewUrl: rawIngImgUrl && (rawIngImgUrl.startsWith("http://") || rawIngImgUrl.startsWith("https://")) ? rawIngImgUrl : "",
            ingredientsImageFilename: "",
            isIngredientsManuallyAssigned: false,
            hasErrors: rowErrors.length > 0,
            errors: rowErrors
          });
        });

        // Auto-match with any already uploaded photos (both front & ingredients)
        const withMatchedImages = matchImagesWithRows(normalized, attachedImages);
        setParsedRows(withMatchedImages);
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

  /* 3. HANDLE BATCH IMAGES UPLOAD (DROPZONE & FILE INPUT) */
  const handleBatchImagesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    addImagesToState(files);
  };

  const addImagesToState = (newFiles) => {
    const validImageFiles = newFiles.filter((f) => f.type.startsWith("image/"));
    if (!validImageFiles.length) return;

    const formatted = validImageFiles.map((file) => ({
      file,
      name: file.name,
      baseName: file.name.replace(/\.[^/.]+$/, ""),
      size: (file.size / 1024).toFixed(1),
      previewUrl: URL.createObjectURL(file)
    }));

    setAttachedImages((prev) => {
      const merged = [...prev];
      formatted.forEach((newImg) => {
        if (!merged.some((m) => m.name.toLowerCase() === newImg.name.toLowerCase())) {
          merged.push(newImg);
        }
      });
      // Re-run matching against parsed rows
      if (parsedRows.length > 0) {
        const updatedRows = matchImagesWithRows(parsedRows, merged);
        setParsedRows(updatedRows);
      }
      return merged;
    });
  };

  /* 4. PER-ROW SINGLE IMAGE PICKER (MAIN OR INGREDIENTS) */
  const handleTriggerRowImagePick = (rowNum, type = "main") => {
    setTargetRowForImage({ rowNum, type });
    singleRowImageInputRef.current?.click();
  };

  const handleSingleRowImagePicked = (e) => {
    const pickedFile = e.target.files?.[0];
    if (!pickedFile || !targetRowForImage) return;

    const previewUrl = URL.createObjectURL(pickedFile);
    const newImageItem = {
      file: pickedFile,
      name: pickedFile.name,
      baseName: pickedFile.name.replace(/\.[^/.]+$/, ""),
      size: (pickedFile.size / 1024).toFixed(1),
      previewUrl
    };

    const { rowNum, type } = targetRowForImage;

    setParsedRows((prev) =>
      prev.map((r) => {
        if (r.rowNum === rowNum) {
          if (type === "ingredients") {
            return {
              ...r,
              localIngredientsImageFile: pickedFile,
              localIngredientsPreviewUrl: previewUrl,
              ingredientsImageFilename: pickedFile.name,
              isIngredientsManuallyAssigned: true
            };
          } else {
            return {
              ...r,
              localImageFile: pickedFile,
              localPreviewUrl: previewUrl,
              imageFilename: pickedFile.name,
              isManuallyAssigned: true
            };
          }
        }
        return r;
      })
    );

    setAttachedImages((prev) => {
      if (prev.some((p) => p.name.toLowerCase() === pickedFile.name.toLowerCase())) {
        return prev;
      }
      return [...prev, newImageItem];
    });

    setTargetRowForImage(null);
    e.target.value = "";
  };

  /* 5. OPEN & SAVE WHOLE PRODUCT FORM MODAL */
  const handleOpenEditModal = (row) => {
    setEditingRow(row);
    setModalActiveTab("essentials");
    setEditFormData({
      title: row.title || "",
      price: row.price || "",
      discount_percent: row.discount_percent || "0",
      stock: row.stock || "",
      size: row.size || "",
      net_weight: row.net_weight || row.size || "",
      category: row.category || "General",
      brand_name: row.brand_name === "—" ? "" : (row.brand_name || ""),
      sku: row.sku === "—" ? "" : (row.sku || ""),
      barcode: row.barcode === "—" ? "" : (row.barcode || ""),
      care_type: row.care_type || "",
      concern_type: row.concern_type || "",
      dietary_type: row.dietary_type || "",
      flavour: row.flavour || "",
      calories: row.calories || "",
      sugar: row.sugar || "",
      fat: row.fat || "",
      protein: row.protein || "",
      serving_size: row.serving_size || "",
      servings_per_container: row.servings_per_container || "",
      nutrition_per_100g: row.nutrition_per_100g || "",
      nutrition_per_serving: row.nutrition_per_serving || "",
      description: row.description || "",
      how_to_use: row.how_to_use || "",
      making_process: row.making_process || "",
      ingredients: row.ingredients || "",
      manufacturer_name: row.manufacturer_name || "",
      manufacturer_address: row.manufacturer_address || "",
      fssai_license: row.fssai_license || "",
      batch_number: row.batch_number || "",
      mfg_date: row.mfg_date ? String(row.mfg_date).slice(0, 10) : "",
      expiry_date: row.expiry_date ? String(row.expiry_date).slice(0, 10) : "",
      // Front image
      localPreviewUrl: row.localPreviewUrl || "",
      imageFilename: row.imageFilename || "",
      localImageFile: row.localImageFile || null,
      imageUrl: row.imageUrl || "",
      // Ingredients label image
      localIngredientsPreviewUrl: row.localIngredientsPreviewUrl || "",
      ingredientsImageFilename: row.ingredientsImageFilename || "",
      localIngredientsImageFile: row.localIngredientsImageFile || null,
      ingredientsImageUrl: row.ingredientsImageUrl || ""
    });
  };

  const handleSaveEditModal = () => {
    if (!editingRow) return;

    // Recalculate validation for this updated row
    const rowErrors = [];
    if (!editFormData.title.trim()) rowErrors.push("Product Title is missing");

    const cleanPrice = String(editFormData.price).replace(/[₹,\s]/g, "");
    if (!cleanPrice || isNaN(Number(cleanPrice)) || Number(cleanPrice) <= 0) {
      rowErrors.push(`Invalid price "${editFormData.price}" (must be > ₹0)`);
    }

    const cleanStock = String(editFormData.stock).replace(/[,\s]/g, "");
    if (cleanStock === "" || isNaN(Number(cleanStock)) || Number(cleanStock) < 0) {
      rowErrors.push(`Invalid stock "${editFormData.stock}" (must be ≥ 0)`);
    }

    if (!editFormData.size.trim()) {
      rowErrors.push("Size / Net Quantity is missing");
    }

    const updatedRow = {
      ...editingRow,
      title: editFormData.title.trim(),
      price: cleanPrice,
      discount_percent: editFormData.discount_percent || "0",
      stock: cleanStock,
      size: editFormData.size.trim(),
      net_weight: editFormData.net_weight.trim() || editFormData.size.trim(),
      category: editFormData.category || "General",
      brand_name: editFormData.brand_name.trim() || "—",
      sku: editFormData.sku.trim() || "—",
      barcode: editFormData.barcode.trim() || "—",
      care_type: editFormData.care_type,
      concern_type: editFormData.concern_type,
      dietary_type: editFormData.dietary_type,
      flavour: editFormData.flavour,
      calories: editFormData.calories,
      sugar: editFormData.sugar,
      fat: editFormData.fat,
      protein: editFormData.protein,
      serving_size: editFormData.serving_size,
      servings_per_container: editFormData.servings_per_container,
      nutrition_per_100g: editFormData.nutrition_per_100g,
      nutrition_per_serving: editFormData.nutrition_per_serving,
      description: editFormData.description,
      how_to_use: editFormData.how_to_use,
      making_process: editFormData.making_process,
      ingredients: editFormData.ingredients,
      manufacturer_name: editFormData.manufacturer_name,
      manufacturer_address: editFormData.manufacturer_address,
      fssai_license: editFormData.fssai_license,
      batch_number: editFormData.batch_number,
      mfg_date: editFormData.mfg_date,
      expiry_date: editFormData.expiry_date,
      // Front image
      localPreviewUrl: editFormData.localPreviewUrl,
      imageFilename: editFormData.imageFilename,
      localImageFile: editFormData.localImageFile,
      imageUrl: editFormData.imageUrl || editingRow.imageUrl,
      isManuallyAssigned: editFormData.localImageFile ? true : editingRow.isManuallyAssigned,
      // Ingredients image
      localIngredientsPreviewUrl: editFormData.localIngredientsPreviewUrl,
      ingredientsImageFilename: editFormData.ingredientsImageFilename,
      localIngredientsImageFile: editFormData.localIngredientsImageFile,
      ingredientsImageUrl: editFormData.ingredientsImageUrl || editingRow.ingredientsImageUrl,
      isIngredientsManuallyAssigned: editFormData.localIngredientsImageFile ? true : editingRow.isIngredientsManuallyAssigned,
      hasErrors: rowErrors.length > 0,
      errors: rowErrors
    };

    setParsedRows((prev) =>
      prev.map((r) => (r.rowNum === editingRow.rowNum ? updatedRow : r))
    );

    // Update validationIssues banner
    setValidationIssues((prev) => {
      const filtered = prev.filter((iss) => iss.row !== editingRow.rowNum);
      if (rowErrors.length > 0) {
        filtered.push({ row: editingRow.rowNum, title: updatedRow.title, errors: rowErrors });
      }
      return filtered;
    });

    setEditingRow(null);
  };

  /* Modal Photo Pickers */
  const handleModalPhotoSelect = (e, type = "main") => {
    const pickedFile = e.target.files?.[0];
    if (!pickedFile) return;

    const previewUrl = URL.createObjectURL(pickedFile);

    if (type === "ingredients") {
      setEditFormData((prev) => ({
        ...prev,
        localIngredientsImageFile: pickedFile,
        ingredientsImageFilename: pickedFile.name,
        localIngredientsPreviewUrl: previewUrl
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        localImageFile: pickedFile,
        imageFilename: pickedFile.name,
        localPreviewUrl: previewUrl
      }));
    }

    setAttachedImages((prev) => {
      if (prev.some((p) => p.name.toLowerCase() === pickedFile.name.toLowerCase())) return prev;
      return [
        ...prev,
        {
          file: pickedFile,
          name: pickedFile.name,
          baseName: pickedFile.name.replace(/\.[^/.]+$/, ""),
          size: (pickedFile.size / 1024).toFixed(1),
          previewUrl
        }
      ];
    });

    e.target.value = "";
  };

  /* 6. SUBMIT TO BACKEND (EXCEL + ALL IMAGES + COMPREHENSIVE OVERRIDES) */
  const handleSubmitUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress(15);

      const formData = new FormData();
      formData.append("file", file);

      // Collect all image files without duplicates (both front and ingredients photos)
      const uniqueImageFiles = new Map();

      attachedImages.forEach((img) => {
        if (img.file) uniqueImageFiles.set(img.name.toLowerCase(), img.file);
      });

      parsedRows.forEach((r) => {
        if (r.localImageFile) {
          uniqueImageFiles.set(r.localImageFile.name.toLowerCase(), r.localImageFile);
        }
        if (r.localIngredientsImageFile) {
          uniqueImageFiles.set(r.localIngredientsImageFile.name.toLowerCase(), r.localIngredientsImageFile);
        }
      });

      uniqueImageFiles.forEach((imgFile) => {
        formData.append("images", imgFile);
      });

      // Prepare comprehensive overrides JSON for all rows
      const overrides = {};
      parsedRows.forEach((r) => {
        overrides[r.rowNum] = {
          title: r.title,
          price: r.price,
          discount_percent: r.discount_percent || "0",
          stock: r.stock,
          size: r.size,
          net_weight: r.net_weight,
          category: r.category !== "General" ? r.category : undefined,
          brand_name: r.brand_name !== "—" ? r.brand_name : undefined,
          sku: r.sku !== "—" ? r.sku : undefined,
          barcode: r.barcode !== "—" ? r.barcode : undefined,
          care_type: r.care_type || undefined,
          concern_type: r.concern_type || undefined,
          dietary_type: r.dietary_type || undefined,
          flavour: r.flavour || undefined,
          calories: r.calories || undefined,
          sugar: r.sugar || undefined,
          fat: r.fat || undefined,
          protein: r.protein || undefined,
          serving_size: r.serving_size || undefined,
          servings_per_container: r.servings_per_container || undefined,
          nutrition_per_100g: r.nutrition_per_100g || undefined,
          nutrition_per_serving: r.nutrition_per_serving || undefined,
          description: r.description || null,
          how_to_use: r.how_to_use || null,
          making_process: r.making_process || null,
          ingredients: r.ingredients || null,
          manufacturer_name: r.manufacturer_name || undefined,
          manufacturer_address: r.manufacturer_address || undefined,
          fssai_license: r.fssai_license || undefined,
          batch_number: r.batch_number || undefined,
          mfg_date: r.mfg_date || undefined,
          expiry_date: r.expiry_date || undefined,
          imageFilename: r.imageFilename || (r.localImageFile ? r.localImageFile.name : null),
          image_url: r.imageUrl || null,
          ingredientsImageFilename: r.ingredientsImageFilename || (r.localIngredientsImageFile ? r.localIngredientsImageFile.name : null),
          ingredients_image_url: r.ingredientsImageUrl || null
        };
      });

      formData.append("overrides", JSON.stringify(overrides));

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

  /* 7. EXPORT RESULTS REPORT TO SPREADSHEET */
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

  // Filtered Preview Rows
  const filteredPreviewRows = useMemo(() => {
    return parsedRows.filter((r) => {
      if (previewSearch.trim()) {
        const query = previewSearch.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(query);
        const matchesSku = r.sku.toLowerCase().includes(query);
        const matchesCategory = r.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSku && !matchesCategory) return false;
      }

      if (previewFilter === "missing-main") return !r.localPreviewUrl;
      if (previewFilter === "missing-label") return !r.localIngredientsPreviewUrl;
      if (previewFilter === "both-photos") return !!r.localPreviewUrl && !!r.localIngredientsPreviewUrl;
      if (previewFilter === "missing-desc") return !r.description;
      if (previewFilter === "has-desc") return !!r.description;

      return true;
    });
  }, [parsedRows, previewSearch, previewFilter]);

  // Filtered Results
  const filteredResults = results?.results?.filter((r) => {
    if (activeResultTab === "success") return r.status === "success";
    if (activeResultTab === "failed") return r.status === "failed";
    return true;
  }) || [];

  const mainPhotoCount = parsedRows.filter((r) => !!r.localPreviewUrl).length;
  const labelPhotoCount = parsedRows.filter((r) => !!r.localIngredientsPreviewUrl).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Hidden file input for per-row photo picking (Main or Ingredients) */}
      <input
        ref={singleRowImageInputRef}
        type="file"
        accept="image/*"
        onChange={handleSingleRowImagePicked}
        className="hidden"
      />

      {/* 1. TOP BREADCRUMB & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1.5">
            <Link to="/vendor" className="hover:text-primary transition">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to="/vendor/products" className="hover:text-primary transition">My Products</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-bold">Bulk Excel &amp; Photos Upload</span>
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
                Upload spreadsheet, attach front &amp; ingredients packaging photos, customize full product forms, and publish.
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

      {/* 2. THREE-STEP WORKFLOW CARDS */}
      {!results && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* STEP 1: DOWNLOAD PREFILLED TEMPLATE */}
          <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <h3 className="font-bold text-slate-900 text-base">Download Template</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use our pre-configured spreadsheet containing product columns, guidelines, and sample entries.
              </p>

              {/* Column Legend */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Info className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dual Photo Support</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-600">
                  <p>• <strong>Main Photo</strong>: Front product packaging</p>
                  <p>• <strong>Ingredients Photo</strong>: Back label / nutrition facts</p>
                  <p>• Name files e.g. <span className="font-mono text-emerald-700">honey.jpg</span> and <span className="font-mono text-emerald-700">honey_ingredients.jpg</span></p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadTemplate}
              disabled={isDownloadingTemplate}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs active:scale-95 disabled:opacity-60"
            >
              {isDownloadingTemplate ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Preparing Template...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Excel (.xlsx) Template</span>
                </>
              )}
            </button>
          </div>

          {/* STEP 2: UPLOAD SPREADSHEET */}
          <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <h3 className="font-bold text-slate-900 text-base">Upload Spreadsheet</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Drop your filled Excel sheet here. It will immediately parse and validate rows.
              </p>

              {/* Excel Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) {
                    processSelectedFile(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/30 rounded-2xl p-5 text-center cursor-pointer transition group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-10 h-10 mx-auto rounded-xl bg-white border border-slate-200 group-hover:border-emerald-400 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition shadow-2xs mb-2">
                  <Upload className="w-5 h-5" />
                </div>

                {file ? (
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 text-xs truncate">{file.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} items
                    </p>
                    <span className="inline-block mt-1 text-[11px] text-emerald-600 font-bold underline">
                      Choose different file
                    </span>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800 text-xs">
                      Drop <span className="text-emerald-600 font-mono">.xlsx</span> spreadsheet
                    </p>
                    <p className="text-[11px] text-slate-500">or click to browse</p>
                  </div>
                )}
              </div>
            </div>

            {parsing && (
              <div className="p-2.5 rounded-xl bg-slate-100 flex items-center justify-center gap-2 text-xs text-slate-600 font-semibold animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Reading sheet...</span>
              </div>
            )}

            {file && !parsing && (
              <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{parsedRows.length} Products parsed ready</span>
              </div>
            )}
          </div>

          {/* STEP 3: ATTACH ALL PRODUCT & INGREDIENT PHOTOS */}
          <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <h3 className="font-bold text-slate-900 text-base">Attach Product Photos</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Drop all product &amp; ingredient label photos. Matches front photos &amp; back label photos!
              </p>

              {/* Photos Dropzone */}
              <div
                onClick={() => imagesInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files) {
                    addImagesToState(Array.from(e.dataTransfer.files));
                  }
                }}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/30 rounded-2xl p-5 text-center cursor-pointer transition group"
              >
                <input
                  ref={imagesInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleBatchImagesSelected}
                  className="hidden"
                />

                <div className="w-10 h-10 mx-auto rounded-xl bg-white border border-slate-200 group-hover:border-emerald-400 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition shadow-2xs mb-2">
                  <Camera className="w-5 h-5" />
                </div>

                {attachedImages.length > 0 ? (
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 text-xs">
                      {attachedImages.length} Image{attachedImages.length > 1 ? "s" : ""} in Pool
                    </p>
                    <p className="text-[11px] text-emerald-600 font-semibold">
                      {mainPhotoCount} Front • {labelPhotoCount} Label matched
                    </p>
                    <span className="inline-block text-[11px] text-slate-400 underline">
                      Click to add more images
                    </span>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800 text-xs">
                      Drop <span className="text-emerald-600 font-mono">product &amp; label photos</span>
                    </p>
                    <p className="text-[11px] text-slate-500">Auto-matches by filename or SKU</p>
                  </div>
                )}
              </div>
            </div>

            {/* Image Status Bar */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                {attachedImages.length > 0 ? `${attachedImages.length} photos loaded` : "No photos loaded yet"}
              </span>
              {attachedImages.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setAttachedImages([]);
                    setParsedRows((prev) =>
                      prev.map((r) => ({
                        ...r,
                        localImageFile: null,
                        localPreviewUrl: r.imageUrl?.startsWith("http") ? r.imageUrl : "",
                        imageFilename: "",
                        localIngredientsImageFile: null,
                        localIngredientsPreviewUrl: r.ingredientsImageUrl?.startsWith("http") ? r.ingredientsImageUrl : "",
                        ingredientsImageFilename: ""
                      }))
                    );
                  }}
                  className="text-[11px] text-rose-600 hover:underline font-bold"
                >
                  Clear all photos
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VALIDATION WARNINGS BANNER */}
      {validationIssues.length > 0 && !results && (
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Validation Warning: {validationIssues.length} row(s) contain issues</span>
          </div>
          <div className="max-h-24 overflow-y-auto space-y-1 text-[11px] text-amber-800 pl-6 list-disc">
            {validationIssues.slice(0, 5).map((iss, i) => (
              <div key={i}>
                Row {iss.row} ({iss.title}): {iss.errors ? iss.errors.join(", ") : iss.error}
              </div>
            ))}
            {validationIssues.length > 5 && (
              <div className="font-bold text-amber-900">
                ...and {validationIssues.length - 5} more rows with warnings. Click &quot;Edit Details&quot; on any row to fix.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. PRE-UPLOAD INTERACTIVE PREVIEW & EDITING TABLE */}
      {!results && parsedRows.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          {/* Top Bar with Filter & Search */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>Pre-Upload Catalog Preview ({parsedRows.length} Items)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Preview your products, inspect front &amp; ingredient label photos, and click &quot;Edit Details&quot; to customize all fields.
              </p>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by title, SKU, category..."
                  value={previewSearch}
                  onChange={(e) => setPreviewSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-emerald-500 w-52 sm:w-60"
                />
              </div>

              <select
                value={previewFilter}
                onChange={(e) => setPreviewFilter(e.target.value)}
                className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-emerald-500"
              >
                <option value="all">All Products ({parsedRows.length})</option>
                <option value="missing-main">Missing Front Photo ({parsedRows.filter(r => !r.localPreviewUrl).length})</option>
                <option value="missing-label">Missing Label Photo ({parsedRows.filter(r => !r.localIngredientsPreviewUrl).length})</option>
                <option value="both-photos">Both Photos Ready ({parsedRows.filter(r => !!r.localPreviewUrl && !!r.localIngredientsPreviewUrl).length})</option>
                <option value="missing-desc">Needs Description ({parsedRows.filter(r => !r.description).length})</option>
              </select>

              <button
                onClick={handleSubmitUpload}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs active:scale-95 disabled:opacity-50 ml-auto"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing ({uploadProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Upload &amp; Publish {parsedRows.length} Products</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3">Row</th>
                  <th className="px-4 py-3 min-w-[190px]">Photos (Front &amp; Label)</th>
                  <th className="px-4 py-3">Product Title &amp; Category</th>
                  <th className="px-4 py-3">Price &amp; Stock</th>
                  <th className="px-4 py-3">Size / SKU</th>
                  <th className="px-4 py-3">Description &amp; Details</th>
                  <th className="px-4 py-3 text-right">Edit Full Form</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPreviewRows.slice(0, 50).map((row) => (
                  <tr key={row.rowNum} className={row.hasErrors ? "bg-rose-50/40" : "hover:bg-slate-50/60"}>
                    <td className="px-3 py-3 font-mono font-bold text-slate-400">#{row.rowNum}</td>

                    {/* DUAL PHOTO THUMBNAILS: FRONT + INGREDIENTS LABEL */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {/* 1. Front Product Image */}
                        <div className="flex flex-col items-center">
                          {row.localPreviewUrl ? (
                            <div className="relative group w-11 h-11 shrink-0">
                              <img
                                src={row.localPreviewUrl}
                                alt="Front"
                                className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs"
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                              />
                              <button
                                type="button"
                                onClick={() => handleTriggerRowImagePick(row.rowNum, "main")}
                                className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[9px] font-bold"
                                title="Change front photo"
                              >
                                Change
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleTriggerRowImagePick(row.rowNum, "main")}
                              className="w-11 h-11 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 flex flex-col items-center justify-center text-slate-400 hover:text-emerald-700 transition"
                              title="Attach Front Photo"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span className="text-[8px] font-bold">Front</span>
                            </button>
                          )}
                          <span className="text-[9px] text-slate-500 font-bold mt-0.5">Front</span>
                        </div>

                        {/* 2. Ingredients / Back Label Image */}
                        <div className="flex flex-col items-center">
                          {row.localIngredientsPreviewUrl ? (
                            <div className="relative group w-11 h-11 shrink-0">
                              <img
                                src={row.localIngredientsPreviewUrl}
                                alt="Label"
                                className="w-11 h-11 rounded-xl object-cover border border-amber-300 shadow-2xs bg-amber-50"
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                              />
                              <button
                                type="button"
                                onClick={() => handleTriggerRowImagePick(row.rowNum, "ingredients")}
                                className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[9px] font-bold"
                                title="Change ingredients label photo"
                              >
                                Change
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleTriggerRowImagePick(row.rowNum, "ingredients")}
                              className="w-11 h-11 rounded-xl border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-100/60 flex flex-col items-center justify-center text-amber-700 hover:text-amber-900 transition"
                              title="Attach Ingredients / Nutrition Packaging Photo"
                            >
                              <Plus className="w-3.5 h-3.5 text-amber-600" />
                              <span className="text-[8px] font-bold text-amber-800">Label</span>
                            </button>
                          )}
                          <span className="text-[9px] text-amber-700 font-bold mt-0.5">Label</span>
                        </div>
                      </div>
                    </td>

                    {/* PRODUCT TITLE & CATEGORY */}
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900 line-clamp-1" title={row.title}>
                        {row.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                          {row.category}
                        </span>
                        {row.brand_name && row.brand_name !== "—" && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            by {row.brand_name}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* PRICE & STOCK */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-black text-slate-900">₹{row.price}</span>
                      {row.discount_percent && Number(row.discount_percent) > 0 && (
                        <span className="text-[10px] font-bold text-rose-600 ml-1">
                          ({row.discount_percent}% off)
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono ml-1.5">
                        ({row.stock} in stock)
                      </span>
                    </td>

                    {/* SIZE & SKU */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-slate-800 font-semibold">{row.size}</p>
                      <p className="text-[10px] font-mono text-slate-400">
                        SKU: {row.sku || "—"}
                      </p>
                    </td>

                    {/* DESCRIPTION & DETAILS SNIPPET */}
                    <td className="px-4 py-3 max-w-[220px]">
                      {row.description ? (
                        <div className="space-y-0.5">
                          <p className="text-[11px] text-slate-700 line-clamp-1 italic" title={row.description}>
                            &quot;{row.description}&quot;
                          </p>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                            <Check className="w-3 h-3" />
                            <span>Description ready ({row.description.length} chars)</span>
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(row)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Description / Details</span>
                        </button>
                      )}
                    </td>

                    {/* QUICK EDIT FULL FORM ACTION */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(row)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold transition shadow-2xs active:scale-95"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Edit Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPreviewRows.length > 50 && (
            <p className="text-[11px] text-slate-400 text-center font-medium">
              Showing first 50 of {filteredPreviewRows.length} filtered items. All items will be published.
            </p>
          )}
        </div>
      )}

      {/* 4. MODAL: FULL COMPREHENSIVE PRODUCT FORM */}
      {editingRow && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 my-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                  Row #{editingRow.rowNum} • Complete Product Form Editor
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  {editFormData.title || "(Untitled Product)"}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                    {editFormData.category || "General"}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    SKU: {editFormData.sku || "—"}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    ₹{editFormData.price || "0"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEditingRow(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TAB BAR FOR COMPLETE FORM NAVIGATION */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 text-xs">
              {[
                { id: "essentials", label: "1. Essentials & Pricing", icon: Package },
                { id: "photos", label: "2. Front & Label Photos", icon: Camera },
                { id: "descriptions", label: "3. Descriptions & Usage", icon: FileText },
                { id: "categorization", label: "4. Health & Diet", icon: Activity },
                { id: "nutrition", label: "5. Nutrition Facts", icon: Flame },
                { id: "compliance", label: "6. Manufacturer & FSSAI", icon: Building }
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isActive = modalActiveTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setModalActiveTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENTS (SCROLLABLE BODY) */}
            <div className="max-h-[62vh] overflow-y-auto pr-1 space-y-4">
              {/* TAB 1: ESSENTIALS & PRICING */}
              {modalActiveTab === "essentials" && (
                <div className="space-y-4">
                  {/* Product Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span>Product Title</span>
                      <span className="text-rose-500 font-black">* [REQUIRED]</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      placeholder="e.g. Organic Himalayan Raw Forest Honey"
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500 font-semibold text-slate-900"
                    />
                  </div>

                  {/* Category & Brand Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Category Name</label>
                      <select
                        value={editFormData.category}
                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white text-slate-800 font-semibold focus:outline-emerald-500"
                      >
                        <option value="General">General / Standard</option>
                        {categoriesList.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Brand Name</label>
                      <input
                        type="text"
                        value={editFormData.brand_name}
                        onChange={(e) => setEditFormData({ ...editFormData, brand_name: e.target.value })}
                        placeholder="e.g. NaturePure Organic"
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Price, Discount, Stock */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <span>Price (₹)</span>
                        <span className="text-rose-500 font-black">* [REQUIRED]</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                        <input
                          type="number"
                          value={editFormData.price}
                          onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                          placeholder="499"
                          className="w-full text-xs rounded-xl border border-slate-200 pl-7 pr-3 py-2.5 focus:outline-emerald-500 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Discount Percent (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="90"
                          value={editFormData.discount_percent}
                          onChange={(e) => setEditFormData({ ...editFormData, discount_percent: e.target.value })}
                          placeholder="0"
                          className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500 font-mono"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <span>Stock Quantity</span>
                        <span className="text-rose-500 font-black">* [REQUIRED]</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editFormData.stock}
                        onChange={(e) => setEditFormData({ ...editFormData, stock: e.target.value })}
                        placeholder="50"
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500 font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Size & Net Weight */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <span>Size / Net Quantity</span>
                        <span className="text-rose-500 font-black">* [REQUIRED]</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.size}
                        onChange={(e) => setEditFormData({ ...editFormData, size: e.target.value })}
                        placeholder="e.g. 500g, 1L, 100 capsules"
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Net Weight</label>
                      <input
                        type="text"
                        value={editFormData.net_weight}
                        onChange={(e) => setEditFormData({ ...editFormData, net_weight: e.target.value })}
                        placeholder="e.g. 500g"
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500"
                      />
                    </div>
                  </div>

                  {/* SKU & Barcode */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">SKU Code</label>
                      <input
                        type="text"
                        value={editFormData.sku}
                        onChange={(e) => setEditFormData({ ...editFormData, sku: e.target.value })}
                        placeholder="e.g. NPO-HONEY-500"
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Barcode / EAN</label>
                      <input
                        type="text"
                        value={editFormData.barcode}
                        onChange={(e) => setEditFormData({ ...editFormData, barcode: e.target.value })}
                        placeholder="e.g. 8901234567890"
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FRONT & LABEL PHOTOS */}
              {modalActiveTab === "photos" && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Upload or replace the front product packaging image and the ingredients/back label packaging image.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Front Photo */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                          1. Main Front Product Photo
                        </span>
                        <div className="w-full h-44 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                          {editFormData.localPreviewUrl ? (
                            <img
                              src={editFormData.localPreviewUrl}
                              alt="Front"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="text-center p-4 text-slate-400">
                              <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                              <span className="text-xs">No Front Image Attached</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[11px] text-slate-600 truncate font-mono">
                          {editFormData.imageFilename || (editFormData.localPreviewUrl ? "Existing Image URL" : "—")}
                        </p>
                        <div className="flex items-center gap-2">
                          <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition shadow-2xs">
                            <Camera className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{editFormData.localPreviewUrl ? "Replace Photo" : "Upload Front Photo"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleModalPhotoSelect(e, "main")}
                              className="hidden"
                            />
                          </label>
                          {editFormData.localPreviewUrl && (
                            <button
                              type="button"
                              onClick={() => setEditFormData({ ...editFormData, localPreviewUrl: "", imageFilename: "", localImageFile: null, imageUrl: "" })}
                              className="p-2 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
                              title="Remove Front Photo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ingredients Label Photo */}
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block mb-1">
                          2. Ingredients &amp; Nutrition Label Photo
                        </span>
                        <div className="w-full h-44 rounded-xl bg-white border border-amber-300 flex items-center justify-center overflow-hidden">
                          {editFormData.localIngredientsPreviewUrl ? (
                            <img
                              src={editFormData.localIngredientsPreviewUrl}
                              alt="Ingredients Label"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="text-center p-4 text-amber-500">
                              <Tag className="w-8 h-8 mx-auto mb-1 opacity-50" />
                              <span className="text-xs">No Label Image Attached</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[11px] text-amber-900 truncate font-mono">
                          {editFormData.ingredientsImageFilename || (editFormData.localIngredientsPreviewUrl ? "Existing Label Image URL" : "—")}
                        </p>
                        <div className="flex items-center gap-2">
                          <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition shadow-2xs">
                            <Camera className="w-3.5 h-3.5" />
                            <span>{editFormData.localIngredientsPreviewUrl ? "Replace Label" : "Upload Label Photo"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleModalPhotoSelect(e, "ingredients")}
                              className="hidden"
                            />
                          </label>
                          {editFormData.localIngredientsPreviewUrl && (
                            <button
                              type="button"
                              onClick={() => setEditFormData({ ...editFormData, localIngredientsPreviewUrl: "", ingredientsImageFilename: "", localIngredientsImageFile: null, ingredientsImageUrl: "" })}
                              className="p-2 rounded-xl border border-amber-300 text-rose-600 hover:bg-rose-50 transition"
                              title="Remove Label Photo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DESCRIPTIONS & USAGE */}
              {modalActiveTab === "descriptions" && (
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <label>Product Description</label>
                      <span className="text-[11px] font-mono text-slate-400">{editFormData.description.length} chars</span>
                    </div>
                    <textarea
                      rows={4}
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      placeholder="Describe flavor notes, source of origin, customer benefits, packaging details..."
                      className="w-full text-xs rounded-2xl border border-slate-200 p-3 focus:outline-emerald-500 leading-relaxed text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">How To Use / Directions</label>
                    <textarea
                      rows={3}
                      value={editFormData.how_to_use}
                      onChange={(e) => setEditFormData({ ...editFormData, how_to_use: e.target.value })}
                      placeholder="e.g. Take 1 tablespoon every morning with warm water or mix with herbal tea..."
                      className="w-full text-xs rounded-2xl border border-slate-200 p-3 focus:outline-emerald-500 leading-relaxed text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">Manufacturing / Sourcing Process</label>
                    <textarea
                      rows={3}
                      value={editFormData.making_process}
                      onChange={(e) => setEditFormData({ ...editFormData, making_process: e.target.value })}
                      placeholder="e.g. Slow cold-filtered, unprocessed to preserve live enzymes and antioxidants..."
                      className="w-full text-xs rounded-2xl border border-slate-200 p-3 focus:outline-emerald-500 leading-relaxed text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">Ingredients List &amp; Allergens</label>
                    <textarea
                      rows={3}
                      value={editFormData.ingredients}
                      onChange={(e) => setEditFormData({ ...editFormData, ingredients: e.target.value })}
                      placeholder="e.g. 100% Pure Raw Multi-Floral Forest Honey, No Added Sugar, No Preservatives..."
                      className="w-full text-xs rounded-2xl border border-slate-200 p-3 focus:outline-emerald-500 leading-relaxed text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: HEALTH, DIET & CONCERNS */}
              {modalActiveTab === "categorization" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Dietary Classification</label>
                      <select
                        value={editFormData.dietary_type}
                        onChange={(e) => setEditFormData({ ...editFormData, dietary_type: e.target.value })}
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white text-slate-800 font-semibold focus:outline-emerald-500"
                      >
                        <option value="">— Select Dietary Type —</option>
                        {dietaryOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Flavour / Taste</label>
                      <input
                        type="text"
                        value={editFormData.flavour}
                        onChange={(e) => setEditFormData({ ...editFormData, flavour: e.target.value })}
                        placeholder="e.g. Wildflower, Roasted & Salted"
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Health Care Focus</label>
                      <select
                        value={editFormData.care_type}
                        onChange={(e) => setEditFormData({ ...editFormData, care_type: e.target.value })}
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white text-slate-800 font-semibold focus:outline-emerald-500"
                      >
                        <option value="">— Select Care Category —</option>
                        {careOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Concern / Wellness Goal</label>
                      <select
                        value={editFormData.concern_type}
                        onChange={(e) => setEditFormData({ ...editFormData, concern_type: e.target.value })}
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white text-slate-800 font-semibold focus:outline-emerald-500"
                      >
                        <option value="">— Select Concern Goal —</option>
                        {concernOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: NUTRITION FACTS */}
              {modalActiveTab === "nutrition" && (
                <div className="space-y-4">
                  {/* Calorie & Macros */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Calories (kcal)</label>
                      <input
                        type="number"
                        value={editFormData.calories}
                        onChange={(e) => setEditFormData({ ...editFormData, calories: e.target.value })}
                        placeholder="320"
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Sugar (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editFormData.sugar}
                        onChange={(e) => setEditFormData({ ...editFormData, sugar: e.target.value })}
                        placeholder="16"
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Fat (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editFormData.fat}
                        onChange={(e) => setEditFormData({ ...editFormData, fat: e.target.value })}
                        placeholder="0"
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Protein (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editFormData.protein}
                        onChange={(e) => setEditFormData({ ...editFormData, protein: e.target.value })}
                        placeholder="0.5"
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Servings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Serving Size</label>
                      <input
                        type="text"
                        value={editFormData.serving_size}
                        onChange={(e) => setEditFormData({ ...editFormData, serving_size: e.target.value })}
                        placeholder="e.g. 1 Tablespoon (15g)"
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Servings Per Container</label>
                      <input
                        type="text"
                        value={editFormData.servings_per_container}
                        onChange={(e) => setEditFormData({ ...editFormData, servings_per_container: e.target.value })}
                        placeholder="e.g. 33"
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Fact strings */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Nutrition Facts per 100g</label>
                      <input
                        type="text"
                        value={editFormData.nutrition_per_100g}
                        onChange={(e) => setEditFormData({ ...editFormData, nutrition_per_100g: e.target.value })}
                        placeholder="e.g. Energy: 320 kcal, Carbs: 80g, Natural Sugars: 78g, Protein: 0.5g"
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Nutrition Facts per Serving</label>
                      <input
                        type="text"
                        value={editFormData.nutrition_per_serving}
                        onChange={(e) => setEditFormData({ ...editFormData, nutrition_per_serving: e.target.value })}
                        placeholder="e.g. Energy: 48 kcal, Carbs: 12g, Natural Sugars: 11.7g"
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: MANUFACTURER & COMPLIANCE */}
              {modalActiveTab === "compliance" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Manufacturer Name</label>
                      <input
                        type="text"
                        value={editFormData.manufacturer_name}
                        onChange={(e) => setEditFormData({ ...editFormData, manufacturer_name: e.target.value })}
                        placeholder="e.g. NaturePure Organics Ltd"
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">FSSAI License Number</label>
                      <input
                        type="text"
                        value={editFormData.fssai_license}
                        onChange={(e) => setEditFormData({ ...editFormData, fssai_license: e.target.value })}
                        placeholder="14-digit FSSAI License"
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Manufacturer Address</label>
                    <textarea
                      rows={2}
                      value={editFormData.manufacturer_address}
                      onChange={(e) => setEditFormData({ ...editFormData, manufacturer_address: e.target.value })}
                      placeholder="Plot, Industrial Area, City, State, Pincode"
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Batch Number</label>
                      <input
                        type="text"
                        value={editFormData.batch_number}
                        onChange={(e) => setEditFormData({ ...editFormData, batch_number: e.target.value })}
                        placeholder="e.g. HMY-2026-OCT"
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Manufacturing Date</label>
                      <input
                        type="date"
                        value={editFormData.mfg_date}
                        onChange={(e) => setEditFormData({ ...editFormData, mfg_date: e.target.value })}
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Expiry Date</label>
                      <input
                        type="date"
                        value={editFormData.expiry_date}
                        onChange={(e) => setEditFormData({ ...editFormData, expiry_date: e.target.value })}
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">
                Changes apply immediately to this row in the upload batch.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditModal}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes for Row #{editingRow.rowNum}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. POST-UPLOAD RESULTS CONSOLE */}
      {results && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  setAttachedImages([]);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Another Batch</span>
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
