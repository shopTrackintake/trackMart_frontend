import { useEffect, useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getProducts } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { getCart, updateCartItem } from "../../services/cartService";
import { getWishlist, toggleWishlist } from "../../services/wishlistService";
import { Heart } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function Home() {

  const navigate = useNavigate();
  const { role, loading: authLoading } = useContext(AuthContext);
  const [loading,setLoading] = useState(false);
  const [products,setProducts] = useState([]);
  const [categories,setCategories] = useState([]);

  const [cartItems,setCartItems] = useState([]);
  
  const [wishlistIds,setWishlistIds] = useState([]);
const [page, setPage] = useState(1);
const limit = 8;// 9 products per page
const [totalPages, setTotalPages] = useState(1);
  const [category,setCategory] = useState("");
  const [care,setCare] = useState("");
  const [concern,setConcern] = useState("");
  const [price,setPrice] = useState(1000);
  const [sort,setSort] = useState("featured");

  const [searchText,setSearchText] = useState("");

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const canAddToCart = role === null || role === "customer";
const adsData = [
  {
    title: "20% OFF",
    desc: "On Beverages",
    code: "DRINK20",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200",
    bg: "from-orange-200 to-orange-100"
  },
  {
    title: "Buy 1 Get 1",
    desc: "Free snacks",
    code: "BOGO",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200",
    bg: "from-green-200 to-green-100"
  },
  {
    title: "Flat ₹100 OFF",
    desc: "Above ₹499",
    code: "SAVE100",
    image: "https://res.cloudinary.com/dsn1q7hyk/image/upload/v1774419499/love_mart_shopping_cart_feature_745da8fc-fbe5-4db8-a85b-2925b85dfb0c_om3y6b.jpg",
    bg: "from-purple-200 to-purple-100"
  },
  {
    title: "Flash Deal",
    desc: "Ends tonight",
    code: "FLASH",
    image: "https://res.cloudinary.com/dsn1q7hyk/image/upload/v1774419499/9c0639b0-cc6c-4606-bdde-ce5b4ed91d9b_dujsc2.png",
    bg: "from-yellow-200 to-yellow-100"
  },
  {
    title: "Organic Sale",
    desc: "Healthy picks",
    code: "HEALTH10",
    image: "https://res.cloudinary.com/dsn1q7hyk/image/upload/v1774419499/Clinton-Foodmart_ktkl3m.jpg",
    bg: "from-green-100 to-white"
  }
];
const [adIndexes, setAdIndexes] = useState([0, 1, 2, 3]);
useEffect(() => {
  const interval = setInterval(() => {
    setAdIndexes(prev =>
      prev.map((val, i) => (val + 1 + i) % adsData.length)
    );
  }, 2500);

  return () => clearInterval(interval);
}, []);
  const heroData = [
    {
      tag: "Featured Collection",
      title: "Discover Smarter",
      highlight: "Healthy Choices",
      desc: "Explore curated products with real nutrition insights — crafted for your everyday wellness.",
      cta: "Shop Now",
      link: "login",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80"
    },
    {
      tag: "Wellness Essentials",
      title: "Boost Your",
      highlight: "Immunity Naturally",
      desc: "Find products designed to strengthen your health.",
      cta: "Explore Now",
      link: "scroll",
      image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=1200&q=80"
    },
    {
      tag: "Clean Living",
      title: "Eat Clean",
      highlight: "Live Better",
      desc: "Choose food that fuels your lifestyle.",
      cta: "About Us",
      link: "/about",
      image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&q=80"
    }
  ];
const dealsData = [
  {
    title: "Daily Deals",
    desc: "Save on essentials",
    btn: "View Offers",
    color: "orange"
  },
  {
    title: "Mega Sale",
    desc: "Up to 50% OFF",
    btn: "Shop Now",
    color: "green"
  },
  {
    title: "Combo Packs",
    desc: "Best value combos",
    btn: "Explore",
    color: "purple"
  }
];
const [dealIndex, setDealIndex] = useState(0);
useEffect(() => {
  const section = document.getElementById("products-section");
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}, [page]);
useEffect(() => {
  const interval = setInterval(() => {
    setDealIndex(prev => (prev + 1) % dealsData.length);
  }, 3000);

  return () => clearInterval(interval);
}, []);
  const [heroIndex, setHeroIndex] = useState(0);
const deal = dealsData[dealIndex];
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroData.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroData.length]);

  const handleHeroCta = (link) => {
    if (link === "login") {
      if (!role) { navigate("/login"); return; }
      const section = document.getElementById("products-section");
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (link === "scroll") {
      const section = document.getElementById("products-section");
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    navigate(link);
  };

  /* ================= FETCH PRODUCTS ================= */

  useEffect(()=>{
    const fetchProducts = async()=>{
      try{
        setLoading(true);
      const res = await getProducts({
  search: searchQuery,
  category,
  care,
  concern,
  price,
  sort,
  page,
  limit
});
setProducts(res.data.products);
setTotalPages(res.data.totalPages); // temporary  // backend se total pages });
        
      }catch(err){
        console.log(err);
      }finally{
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchQuery, category, care, concern, price, sort, page,limit]);

  /* ================= FETCH CATEGORIES ================= */

  useEffect(()=>{
    const fetchCategories = async()=>{
      try{
        const res = await getCategories();
        setCategories(res.data);
      }catch(err){
        console.log(err);
      }
    };
    fetchCategories();
  },[]);

  /* ================= FETCH CART ================= */

  useEffect(()=>{
    if(authLoading) return;
    if(role!=="customer") return;
    const fetchCart = async()=>{
      try{
        const res = await getCart();
        setCartItems(res.data);
      }catch(err){
        console.log(err);
      }
    };
    fetchCart();
  },[authLoading,role]);

  /* ================= FETCH WISHLIST ================= */

  useEffect(()=>{
    if(authLoading) return;
    if(role!=="customer") return;
    const fetchWishlist = async()=>{
      try{
        const res = await getWishlist();
        setWishlistIds(res.data.map(i=>String(i.product_id)));
      }catch(err){
        console.log(err);
      }
    };
    fetchWishlist();
  },[authLoading,role]);

  const handleSearch = ()=>{
    navigate(`/?search=${searchText}`);
  };

  const getQuantity = (productId)=>{
    const item = cartItems.find(i=>i.id===productId);
    return item ? item.quantity : 0;
  };

  const toggleWishlistItem = async(productId)=>{
    if(!role){ navigate("/login"); return; }
    await toggleWishlist(productId);
    const res = await getWishlist();
    setWishlistIds(res.data.map(i=>String(i.product_id)));
  };

  const increaseQty = async(product)=>{
    if(!role){ navigate("/login"); return; }
    await updateCartItem(product.id,1);
    setCartItems(prev=>{
      const existing = prev.find(p=>p.id===product.id);
      if(existing) return prev.map(p => p.id===product.id ? {...p,quantity:p.quantity+1} : p);
      return [...prev,{...product,quantity:1}];
    });
  };

  const decreaseQty = async(product)=>{
    await updateCartItem(product.id,-1);
    setCartItems(prev =>
      prev.map(p => p.id===product.id ? {...p,quantity:p.quantity-1} : p).filter(p=>p.quantity>0)
    );
  };

  return (

    <div className="space-y-16">

      {/* HERO */}
      <section className="relative w-full rounded-2xl overflow-hidden h-[480px]">
        <div className="absolute inset-0 flex">

          {/* LEFT — 30% text box */}
          <div className="w-[30%] bg-surface-alt flex flex-col justify-center px-8 gap-5 border-r border-default">

            <div>
              <span className="text-sm text-muted uppercase tracking-widest font-medium">
                {heroData[heroIndex].tag}
              </span>
              <h1 className="text-4xl font-bold text-strong leading-tight mt-2">
                {heroData[heroIndex].title}{" "}
                <span className="text-primary">{heroData[heroIndex].highlight}</span>
              </h1>
            </div>

            <p className="text-base text-muted leading-relaxed">
              {heroData[heroIndex].desc}
            </p>

            <button
              onClick={() => handleHeroCta(heroData[heroIndex].link)}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold w-fit hover:bg-primaryHover transition text-base"
            >
              {heroData[heroIndex].cta}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            {/* DOTS */}
            <div className="flex gap-2">
              {heroData.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className={`h-[3px] rounded transition-all duration-300 ${
                    i === heroIndex ? "w-10 bg-primary" : "w-5 bg-default"
                  }`}
                />
              ))}
            </div>

          </div>

          {/* RIGHT — 70% pure image */}
          <div className="w-[70%] relative">
            <img
              key={heroIndex}
              src={heroData[heroIndex].image}
              className="w-full h-full object-cover"
            />

            {/* ARROWS */}
            <div className="absolute bottom-6 right-6 flex gap-2">
              <button
                onClick={() => setHeroIndex((heroIndex - 1 + heroData.length) % heroData.length)}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md text-white text-base font-bold border border-white/30 hover:bg-white hover:text-black transition duration-300"
              >←</button>
              <button
                onClick={() => setHeroIndex((heroIndex + 1) % heroData.length)}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md text-white text-base font-bold border border-white/30 hover:bg-white hover:text-black transition duration-300"
              >→</button>
            </div>
          </div>
</div>
      
      </section>
{/* SEARCH + FILTER BAR */}
<section className="flex gap-6 items-center">

  {/* LEFT ADS */}
  <div className="hidden md:grid grid-cols-2 gap-2 w-[300px] shrink-0">
    {adIndexes.map((index, i) => {
      const ad = adsData[index];
      return (
        <div
          key={i}
          className={`relative h-[60px] rounded-xl overflow-hidden shadow-md bg-gradient-to-r ${ad.bg} flex items-center px-3 py-2`}
        >
          <img src={ad.image} className="w-10 h-10 rounded-lg object-cover" />
          <div className="ml-3 flex-1 flex flex-col justify-center">
            <p className="text-xs font-semibold">{ad.title}</p>
            <p className="text-[10px] text-gray-700">{ad.desc}</p>
          </div>
          <button
            onClick={() => navigate("/products")}
            className="bg-white text-black text-[9px] px-2 py-[2px] rounded shrink-0"
          >
            Shop
          </button>
          <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
        </div>
      );
    })}
  </div>
{/* CENTER FILTERS */}
<div className="flex flex-1 items-center justify-center">

  <div className="flex gap-2 items-center">

    <div className="flex border border-default rounded-xl overflow-hidden">
      <input
        type="text"
        placeholder="Search products..."
        value={searchText}
        onChange={(e)=>setSearchText(e.target.value)}
        className="px-2 py-2 outline-none w-48"
      />
      <button
        onClick={handleSearch}
        className="bg-primary text-white px-4"
      >
        Search
      </button>
    </div>

    <select
      value={care}
      onChange={(e)=>setCare(e.target.value)}
      className="border border-default rounded-xl px-3 py-2"
    >
      <option value="">Care</option>
      <option value="Skin Care">Skin Care</option>
      <option value="Hair Care">Hair Care</option>
      <option value="Digestive Care">Digestive Care</option>
      <option value="Immunity Care">Immunity Care</option>
    </select>

    <select
      value={concern}
      onChange={(e)=>setConcern(e.target.value)}
      className="border border-default rounded-xl px-3 py-2"
    >
      <option value="">Concern</option>
      <option value="Immunity">Immunity</option>
      <option value="Digestion">Digestion</option>
      <option value="Skin Health">Skin Health</option>
      <option value="Weight Loss">Weight Loss</option>
    </select>

    <select
      value={sort}
      onChange={(e)=>setSort(e.target.value)}
      className="border border-default rounded-xl px-3 py-2"
    >
      <option value="featured">Featured</option>
      <option value="price_low">Price Low → High</option>
      <option value="price_high">Price High → Low</option>
    </select>

  </div>

</div>

  {/* RIGHT ADS */}
  <div className="hidden md:flex flex-col gap-2 w-[220px] shrink-0">
    {adIndexes.slice(2,4).map((index, i) => {
      const ad = adsData[index];
      return (
        <div
          key={i}
          className={`relative h-[60px] rounded-xl overflow-hidden shadow-md bg-gradient-to-r ${ad.bg} flex items-center px-3 py-2`}
        >
          <img src={ad.image} className="w-10 h-10 rounded-lg object-cover" />
          <div className="ml-3 flex-1 flex flex-col justify-center">
            <p className="text-xs font-semibold">{ad.title}</p>
            <p className="text-[10px] text-gray-700">{ad.desc}</p>
          </div>
          <button
            onClick={() => navigate("/products")}
            className="bg-white text-black text-[9px] px-2 py-[2px] rounded shrink-0"
          >
            Shop
          </button>
          <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
        </div>
      );
    })}
  </div>

</section>
      {/* SIDEBAR + PRODUCTS */}
      <section id="products-section" className="flex gap-10 h-[80vh] overflow-hidden">

        {/* SIDEBAR */}
        <aside className="w-64 sticky top-0 h-fit">

          <h3 className="font-semibold mb-4">Categories</h3>

          <div className="space-y-2">
            <label className="flex gap-2">
              <input type="radio" name="category" value="" checked={category===""} onChange={()=>setCategory("")} />
              All Products
            </label>
            {categories.map(cat => (
              <label key={cat.id} className="flex gap-2">
                <input
                  type="radio"
                  name="category"
                  value={cat.id}
                  checked={category==cat.id}
                  onChange={(e)=>setCategory(e.target.value)}
                />
                {cat.name}
              </label>
            ))}
          </div>

          <h3 className="font-semibold mt-6 mb-3">Price Range</h3>
          <input
            type="range" min="0" max="1000" step="50"
            value={price}
            onChange={(e)=>setPrice(e.target.value)}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>₹0</span>
            <span>₹{price}</span>
          </div>

          

<div className="mt-6 relative h-[70px] rounded-lg overflow-hidden shadow-sm">

  {/* BACKGROUND GRADIENT (dynamic feel) */}
  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600" />

  {/* CONTENT */}
  <div className="relative h-full flex flex-col justify-between px-2 py-1 text-white">

    {/* TOP TEXT */}
    <div>
      <p className="text-[9px] uppercase opacity-80">Limited Time</p>
      <h4 className="text-[11px] font-semibold leading-tight">
        {deal.title}
      </h4>
      <p className="text-[9px] opacity-90">
        {deal.desc}
      </p>
    </div>

    {/* BUTTON */}
    <button
      onClick={() => navigate("/products")}
      className="bg-white text-black text-[9px] px-2 py-[2px] rounded w-fit font-medium shrink-0"
    >
      {deal.btn}
    </button>

  </div>

  {/* DOTS */}
  <div className="absolute bottom-1 right-1 flex gap-1">
    {dealsData.map((_, i) => (
      <div
        key={i}
        className={`h-1 rounded-full ${
          i === dealIndex ? "w-3 bg-white" : "w-2 bg-white/50"
        }`}
      />
    ))}
  </div>

</div>

        </aside>

        {/* PRODUCTS GRID */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

            {loading ? (
              <div className="col-span-full text-center py-20 text-gray-500 text-lg">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-500 text-lg">No products found</div>
            ) : (
              products.map(product=>{
                const quantity = getQuantity(product.id);
                return(
                  <div
                    key={product.id}
                    className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition"
                  >
                    {product.image_url && (
                      <div className="relative h-56 bg-gray-50 flex items-center justify-center rounded-xl mb-4">
                        <img src={product.image_url} alt={product.title} className="max-h-full max-w-full object-contain" />
                        {role==="customer" && (
                          <button
                            onClick={(e)=>{ e.stopPropagation(); toggleWishlistItem(product.id) }}
                            className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md"
                          >
                            <Heart className={`w-5 h-5 ${wishlistIds.includes(String(product.id)) ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                          </button>
                        )}
                      </div>
                    )}

                    <h3 className="font-primary text-lg font-semibold text-strong">{product.title}</h3>
                    <p className="text-muted text-sm mt-2 line-clamp-2">{product.description}</p>

                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-primary font-bold text-lg">₹{product.price}</span>
                      {product.health_rating && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.health_rating==="Healthy" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {product.health_rating}
                        </span>
                      )}
                    </div>

                    {canAddToCart && (
                      <div className="mt-6">
                        {quantity===0 ? (
                          <button
                            onClick={()=>increaseQty(product)}
                            className="bg-primary text-white w-full py-2 rounded-xl font-semibold hover:bg-primaryHover transition"
                          >
                            Add to Cart
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-6 border border-gray-300 rounded-xl py-2">
                            <button onClick={()=>decreaseQty(product)} className="text-xl font-bold px-4">-</button>
                            <span className="font-semibold text-lg">{quantity}</span>
                            <button onClick={()=>increaseQty(product)} className="text-xl font-bold px-4">+</button>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={()=>navigate(`/product/${product.id}`)}
                      className="mt-3 border border-primary text-primary w-full py-2 rounded-xl font-semibold hover:bg-primary hover:text-white transition"
                    >
                      View Details
                    </button>

                  </div>
                )
              })
            )}

          </div>
        
<div className="flex justify-center items-center gap-3 mt-10">

  {/* PREV */}
  <button
    disabled={page === 1}
    onClick={() => setPage(prev => prev - 1)}
    className="text-xl px-2 disabled:opacity-30"
  >
    ‹
  </button>

  {/* PAGE NUMBERS */}
  {[...Array(totalPages)].map((_, i) => (
    <button
      key={i}
      onClick={() => setPage(i + 1)}
      className={`w-8 h-8 rounded-full flex items-center justify-center ${
        page === i + 1
          ? "bg-black text-white"
          : "text-gray-600 hover:bg-gray-200"
      }`}
    >
      {i + 1}
    </button>
  ))}

  {/* NEXT */}
  <button
    disabled={page === totalPages}
    onClick={() => setPage(prev => prev + 1)}
    className="text-xl px-2 disabled:opacity-30"
  >
    ›
  </button>
</div>
</div>
      </section>

    </div>

  );

}