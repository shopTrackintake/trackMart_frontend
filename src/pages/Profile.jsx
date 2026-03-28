import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import {
  getAddresses,
  updateAddress,
  deleteAddress
} from "../services/addressService";
import { useNavigate } from "react-router-dom";

export default function Profile() {

  const { role } = useContext(AuthContext);
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    house_no: "",
    street: "",
    locality: "",
    city: "",
    state: "",
    pincode: ""
  });

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetchUser();
    if (role === "customer") fetchAddresses();
  }, [role]);

  const fetchUser = async () => {
    try {
      const res = await api.get("/user/profile");
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await getAddresses();
      setAddresses(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= EDIT ADDRESS ================= */

  const handleEditAddress = (addr) => {
    setForm({
      full_name: addr.full_name,
      phone: addr.phone,
      house_no: addr.house_no,
      street: addr.street,
      locality: addr.locality,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode
    });
    setEditingId(addr.id);
  };

  const handleUpdateAddress = async () => {
    try {
      await updateAddress(editingId, form);
      alert("Address updated");
      setEditingId(null);
      fetchAddresses();
    } catch {
      alert("Update failed");
    }
  };

  const handleDeleteAddress = async (id) => {
    await deleteAddress(id);
    fetchAddresses();
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  /* ================= VENDOR UPDATE ================= */

  const [vendorForm, setVendorForm] = useState({
    business_name: "",
    phone: "",
    shop_address: "",
    upi_id: ""
  });

  useEffect(() => {
    if (role === "vendor" && user) {
      setVendorForm({
        business_name: user.business_name || "",
        phone: user.phone || "",
        shop_address: user.shop_address || "",
        upi_id: user.upi_id || ""
      });
    }
  }, [user, role]);

  const handleVendorUpdate = async () => {
    try {
      await api.put("/user/profile", vendorForm);
      alert("Profile updated");
    } catch {
      alert("Update failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">

      <h1 className="text-3xl font-bold">My Profile</h1>

      {/* ================= BASIC INFO ================= */}
      <div className="bg-white p-6 rounded-2xl shadow space-y-4">

        <h2 className="font-semibold text-lg">Basic Info</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input value={user.name || ""} disabled className="input-disabled" />
          <input value={user.email || ""} disabled className="input-disabled" />
        </div>

      </div>

      {/* ================= CUSTOMER ================= */}
      {role === "customer" && (
        <div className="bg-white p-6 rounded-2xl shadow space-y-6">

          <h2 className="text-xl font-semibold">Saved Addresses</h2>

          <div className="grid md:grid-cols-2 gap-6">

            {addresses.map((addr, i) => (
              <div key={addr.id} className="border p-5 rounded-xl relative">

                {/* TAG */}
                <span className="absolute top-3 right-3 text-xs bg-gray-200 px-2 py-1 rounded">
                  {i === 0 ? "Home" : "Other"}
                </span>

                <p className="font-semibold">{addr.full_name}</p>
                <p className="text-sm text-gray-500">{addr.phone}</p>

                <p className="mt-2 text-sm">
                  {addr.house_no}, {addr.street}
                </p>
                <p className="text-sm">
                  {addr.locality}, {addr.city}
                </p>
                <p className="text-sm">
                  {addr.state} - {addr.pincode}
                </p>

                <div className="flex gap-3 mt-4">

                  <button
                    onClick={() => handleEditAddress(addr)}
                    className="px-4 py-1 border rounded-lg text-sm hover:bg-gray-100"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="px-4 py-1 border rounded-lg text-sm text-red-500 hover:bg-red-50"
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))}

          </div>

          {/* EDIT FORM */}
          {editingId && (
            <div className="border p-6 rounded-xl space-y-3">

              <h3 className="font-semibold">Edit Address</h3>

              <input value={form.full_name}
                onChange={e=>setForm({...form,full_name:e.target.value})}
                className="input" placeholder="Full Name"/>

              <input value={form.phone}
                onChange={e=>setForm({...form,phone:e.target.value})}
                className="input" placeholder="Phone"/>

              <input value={form.house_no}
                onChange={e=>setForm({...form,house_no:e.target.value})}
                className="input" placeholder="House No"/>

              <input value={form.street}
                onChange={e=>setForm({...form,street:e.target.value})}
                className="input" placeholder="Street"/>

              <input value={form.locality}
                onChange={e=>setForm({...form,locality:e.target.value})}
                className="input" placeholder="Locality"/>

              <input value={form.city}
                onChange={e=>setForm({...form,city:e.target.value})}
                className="input" placeholder="City"/>

              <input value={form.state}
                onChange={e=>setForm({...form,state:e.target.value})}
                className="input" placeholder="State"/>

              <input value={form.pincode}
                onChange={e=>setForm({...form,pincode:e.target.value})}
                className="input" placeholder="Pincode"/>

              <div className="flex gap-4">
                <button
                  onClick={handleUpdateAddress}
                  className="bg-primary text-white px-6 py-2 rounded-xl"
                >
                  Update
                </button>

                <button
                  onClick={cancelEdit}
                  className="border px-6 py-2 rounded-xl"
                >
                  Cancel
                </button>
              </div>

            </div>
          )}

          {/* MANAGE ADDRESS */}
          <button
            onClick={() => navigate("/checkout")}
            className="text-primary font-medium"
          >
            + Manage Addresses
          </button>

        </div>
      )}

      {/* ================= VENDOR ================= */}
      {role === "vendor" && (
        <div className="bg-white p-6 rounded-2xl shadow space-y-4">

          <h2 className="text-xl font-semibold">Vendor Profile</h2>

          <div className="grid md:grid-cols-2 gap-4">

            <input value={user.name || ""} disabled className="input-disabled" />
            <input value={user.email || ""} disabled className="input-disabled" />

            <input
              value={vendorForm.business_name}
              onChange={e=>setVendorForm({...vendorForm,business_name:e.target.value})}
              className="input"
              placeholder="Business Name"
            />

            <input
              value={vendorForm.phone}
              onChange={e=>setVendorForm({...vendorForm,phone:e.target.value})}
              className="input"
              placeholder="Phone"
            />

          </div>

          <textarea
            value={vendorForm.shop_address}
            onChange={e=>setVendorForm({...vendorForm,shop_address:e.target.value})}
            className="input w-full"
            placeholder="Shop Address"
          />

          <input
            value={vendorForm.upi_id}
            onChange={e=>setVendorForm({...vendorForm,upi_id:e.target.value})}
            className="input"
            placeholder="UPI ID"
          />

          <button
            onClick={handleVendorUpdate}
            className="bg-primary text-white px-6 py-2 rounded-xl"
          >
            Update Profile
          </button>

        </div>
      )}

    </div>
  );
}