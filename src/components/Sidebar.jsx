import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function Sidebar({ role }) {

  const [isOpen, setIsOpen] = useState(false);

  const baseLink =
    "block px-4 py-3 rounded-xl transition font-medium hover:bg-gray-100";

  const activeLink =
    "bg-gray-100 text-primary font-semibold";

  return (
    <>
      {/* 🔥 LEFT EDGE CLICK AREA */}
      <div
        className="md:hidden fixed top-0 left-0 h-full w-4 z-40"
        onClick={() => setIsOpen(true)}
      />

      {/* 🔥 OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 🔥 SIDEBAR */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r p-6 z-50
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >

        {/* TITLE */}
        <h2 className="text-xl font-bold mb-6">
          {role === "customer" && "My Account"}
          {role === "vendor" && "Vendor Panel"}
          {role === "admin" && "Admin Panel"}
        </h2>

        {/* CUSTOMER */}
        {role === "customer" && (
          <div className="space-y-2">
            <NavLink to="/customer" onClick={()=>setIsOpen(false)}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : ""}`}>
              Dashboard
            </NavLink>

            <NavLink to="/customer/orders" onClick={()=>setIsOpen(false)}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : ""}`}>
              Orders
            </NavLink>
          </div>
        )}

        {/* ADMIN */}
        {role === "admin" && (
          <div className="space-y-2">
            <NavLink to="/admin" onClick={()=>setIsOpen(false)}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : ""}`}>
              Dashboard
            </NavLink>

            <NavLink to="/admin/approve-vendors" onClick={()=>setIsOpen(false)}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : ""}`}>
              Approve Vendors
            </NavLink>

            <NavLink to="/admin/vendors" onClick={()=>setIsOpen(false)}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : ""}`}>
              Vendors
            </NavLink>

            <NavLink to="/admin/products" onClick={()=>setIsOpen(false)}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : ""}`}>
              Products
            </NavLink>

            <NavLink to="/admin/orders" onClick={()=>setIsOpen(false)}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : ""}`}>
              Orders
            </NavLink>

            <NavLink to="/admin/vendor-payments" onClick={()=>setIsOpen(false)}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : ""}`}>
              Payments
            </NavLink>

            <NavLink to="/admin/support" onClick={()=>setIsOpen(false)}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : ""}`}>
              Support
            </NavLink>
          </div>
        )}

        {/* VENDOR */}
        {role === "vendor" && (
          <div className="space-y-2">
            <NavLink to="/vendor" onClick={()=>setIsOpen(false)}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : ""}`}>
              Dashboard
            </NavLink>

            <NavLink to="/vendor/add-product" onClick={()=>setIsOpen(false)}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : ""}`}>
              Add Product
            </NavLink>

            <NavLink to="/vendor/products" onClick={()=>setIsOpen(false)}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : ""}`}>
              My Products
            </NavLink>

            <NavLink to="/vendor/orders" onClick={()=>setIsOpen(false)}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : ""}`}>
              Orders
            </NavLink>
          </div>
        )}

      </div>
    </>
  );
}