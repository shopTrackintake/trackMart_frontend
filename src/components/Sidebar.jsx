import { NavLink } from "react-router-dom";

export default function Sidebar({ role }) {

  const baseLink =
    "block px-4 py-3 rounded-xl transition font-medium text-textDefault hover:bg-bgSurfaceAlt hover:text-primary";

  const activeLink =
    "bg-bgSurfaceAlt text-primary font-semibold shadow-sm";

  return (

    <div className="w-64 bg-bgSurface border-r border-borderDefault min-h-screen p-8">

      {/* Title */}

      <h2 className="font-primary text-xl font-bold text-textStrong mb-8">

        {role === "vendor" && "Vendor Panel"}
        {role === "admin" && "Admin Panel"}
        {role === "customer" && "My Account"}

      </h2>



      {/* ================= VENDOR LINKS ================= */}

      {role === "vendor" && (

        <div className="space-y-3">

          <NavLink
            to="/vendor"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : ""}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/vendor/add-product"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : ""}`
            }
          >
            Add Product
          </NavLink>

          <NavLink
            to="/vendor/products"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : ""}`
            }
          >
            My Products
          </NavLink>

          <NavLink
            to="/vendor/orders"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : ""}`
            }
          >
            Orders
          </NavLink>

        </div>

      )}



      {/* ================= ADMIN LINKS ================= */}

      {role === "admin" && (

        <div className="space-y-3">

          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : ""}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/approve-vendors"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : ""}`
            }
          >
            Approve Vendors
          </NavLink>

          <NavLink
            to="/admin/vendors"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : ""}`
            }
          >
            Vendors
          </NavLink>

        </div>

      )}



      {/* ================= CUSTOMER LINKS ================= */}

      {role === "customer" && (

        <div className="space-y-3">

          <NavLink
            to="/customer"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : ""}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/customer/orders"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : ""}`
            }
          >
            Orders
          </NavLink>

        </div>

      )}

    </div>

  );

}