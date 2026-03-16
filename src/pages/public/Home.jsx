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

  const [products,setProducts] = useState([]);
  const [categories,setCategories] = useState([]);

  const [cartItems,setCartItems] = useState([]);
  const [wishlistIds,setWishlistIds] = useState([]);

  const [category,setCategory] = useState("");
  const [care,setCare] = useState("");
  const [concern,setConcern] = useState("");
  const [price,setPrice] = useState(1000);
  const [sort,setSort] = useState("featured");

  const [searchText,setSearchText] = useState("");

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const canAddToCart = role === null || role === "customer";


  /* ================= FETCH PRODUCTS ================= */

  useEffect(()=>{

    const fetchProducts = async()=>{

      try{

        const res = await getProducts({
          search:searchQuery,
          category,
          care,
          concern,
          price,
          sort
        });

        setProducts(res.data);

      }catch(err){
        console.log(err);
      }

    };

    fetchProducts();

  },[searchQuery,category,care,concern,price,sort]);


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

    if(!role){
      navigate("/login");
      return;
    }

    await toggleWishlist(productId);

    const res = await getWishlist();
    setWishlistIds(res.data.map(i=>String(i.product_id)));
  };


  const increaseQty = async(product)=>{

    if(!role){
      navigate("/login");
      return;
    }

    await updateCartItem(product.id,1);

    setCartItems(prev=>{
      const existing = prev.find(p=>p.id===product.id);

      if(existing){
        return prev.map(p =>
          p.id===product.id ? {...p,quantity:p.quantity+1} : p
        );
      }

      return [...prev,{...product,quantity:1}];
    });
  };


  const decreaseQty = async(product)=>{

    await updateCartItem(product.id,-1);

    setCartItems(prev =>
      prev
      .map(p =>
        p.id===product.id
        ? {...p,quantity:p.quantity-1}
        : p
      )
      .filter(p=>p.quantity>0)
    );
  };


  return (

    <div className="space-y-16">


      {/* HERO */}

      <section className="text-center py-20 bg-surface-alt rounded-2xl">

        <h1 className="text-5xl font-primary font-bold text-strong leading-tight">
          Discover Smarter
          <span className="text-primary"> Healthy Choices</span>
        </h1>

        <p className="text-muted mt-6 text-lg max-w-2xl mx-auto">
          Explore curated products with real nutrition insights.
        </p>

      </section>



      {/* SEARCH + FILTER BAR */}

      <section className="flex flex-wrap gap-4 items-center justify-center">

        <div className="flex border border-default rounded-xl overflow-hidden">

          <input
            type="text"
            placeholder="Search products..."
            value={searchText}
            onChange={(e)=>setSearchText(e.target.value)}
            className="px-4 py-2 outline-none w-72"
          />

          <button
            onClick={handleSearch}
            className="bg-primary text-white px-5"
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

      </section>



      {/* SIDEBAR + PRODUCTS */}

      <section className="flex gap-10">


        {/* SIDEBAR */}

        <aside className="w-64">

          <h3 className="font-semibold mb-4">
            Categories
          </h3>

          <div className="space-y-2">

            <label className="flex gap-2">
              <input
                type="radio"
                name="category"
                value=""
                checked={category===""}
                onChange={()=>setCategory("")}
              />
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


          {/* PRICE RANGE */}

          <h3 className="font-semibold mt-6 mb-3">
            Price Range
          </h3>

          <input
            type="range"
            min="0"
            max="1000"
            step="50"
            value={price}
            onChange={(e)=>setPrice(e.target.value)}
            className="w-full"
          />

          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>₹0</span>
            <span>₹{price}</span>
          </div>

        </aside>



        {/* PRODUCTS GRID */}

        <div className="flex-1">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

            {products.map(product=>{

              const quantity = getQuantity(product.id);

              return(

                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition"
                >

                  {product.image_url && (

                    <div className="relative h-56 bg-gray-50 flex items-center justify-center rounded-xl mb-4">

                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="max-h-full max-w-full object-contain"
                      />

                      {role==="customer" && (

                        <button
                          onClick={(e)=>{
                            e.stopPropagation();
                            toggleWishlistItem(product.id)
                          }}
                          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md"
                        >

                          <Heart
                            className={`w-5 h-5 ${
                              wishlistIds.includes(String(product.id))
                              ? "fill-red-500 text-red-500"
                              : "text-gray-400"
                            }`}
                          />

                        </button>

                      )}

                    </div>

                  )}

                  <h3 className="font-primary text-lg font-semibold text-strong">
                    {product.title}
                  </h3>

                  <p className="text-muted text-sm mt-2 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="mt-4 flex justify-between items-center">

                    <span className="text-primary font-bold text-lg">
                      ₹{product.price}
                    </span>

                    {product.health_rating && (

                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.health_rating==="Healthy"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
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

                          <button
                            onClick={()=>decreaseQty(product)}
                            className="text-xl font-bold px-4"
                          >
                            -
                          </button>

                          <span className="font-semibold text-lg">
                            {quantity}
                          </span>

                          <button
                            onClick={()=>increaseQty(product)}
                            className="text-xl font-bold px-4"
                          >
                            +
                          </button>

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

            })}

          </div>

        </div>

      </section>

    </div>

  );

}