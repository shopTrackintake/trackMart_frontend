import { useEffect, useState } from "react";
import {
  getPendingVendors,
  approveVendorById,
  holdVendorById,
  deleteVendorById
} from "../../services/adminService";

export default function ApproveVendors() {

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH VENDORS ================= */

  useEffect(() => {

    const fetchVendors = async () => {

      try {

        const res = await getPendingVendors();
        setVendors(res.data);

      } catch (err) {

        console.log("Error fetching vendors:", err.response?.data);

      } finally {

        setLoading(false);

      }

    };

    fetchVendors();

  }, []);



  /* ================= APPROVE ================= */

  const approveVendor = async (id) => {

    try {

      await approveVendorById(id);

      setVendors(prev =>
        prev.map(v =>
          v.id === id ? { ...v, kyc_status: "approved" } : v
        )
      );

    } catch (err) {

      console.log(err.response?.data);

    }

  };



  /* ================= HOLD ================= */

  const holdVendor = async (id) => {

    try {

      await holdVendorById(id);

      setVendors(prev =>
        prev.map(v =>
          v.id === id ? { ...v, kyc_status: "hold" } : v
        )
      );

    } catch (err) {

      console.log(err.response?.data);

    }

  };



  /* ================= DELETE ================= */

  const deleteVendor = async (id) => {

    if (!window.confirm("Delete this vendor?")) return;

    try {

      await deleteVendorById(id);

      setVendors(prev =>
        prev.filter(v => v.id !== id)
      );

    } catch (err) {

      console.log(err.response?.data);

    }

  };



  return (

    <div className="space-y-8">

      {/* Header */}

      <div>

        <h1 className="text-2xl font-primary font-bold text-textStrong">
          Vendor Approvals
        </h1>

        <p className="text-textDefault mt-2">
          Review vendor registrations.
        </p>

      </div>



      {/* Loading */}

      {loading && (
        <div className="text-textMuted">
          Loading...
        </div>
      )}



      {/* Empty State */}

      {!loading && vendors.length === 0 && (

        <div className="bg-bgSurfaceAlt border border-borderDefault rounded-2xl p-6 text-center text-textMuted">
          No vendors found
        </div>

      )}



      {/* Vendor Cards */}

      <div className="space-y-6">

        {vendors.map((v) => (

          <div
            key={v.id}
            className="bg-bgSurface border border-borderDefault rounded-2xl p-6 shadow-card flex justify-between items-center"
          >

            {/* Vendor Info */}

            <div>

              <h3 className="font-primary font-semibold text-textStrong text-lg">
                {v.business_name}
              </h3>

              <p className="text-textMuted mt-1">
                {v.email}
              </p>



              {/* STATUS BADGES */}

              {v.kyc_status === "pending" && (

                <span className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded-full mt-2 inline-block">
                  Pending
                </span>

              )}

              {v.kyc_status === "hold" && (

                <span className="text-xs px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full mt-2 inline-block">
                  Hold
                </span>

              )}

              {v.kyc_status === "approved" && (

                <span className="text-xs px-3 py-1 bg-green-200 text-green-800 rounded-full mt-2 inline-block">
                  Approved
                </span>

              )}

            </div>



            {/* BUTTONS */}

            <div className="flex gap-4">

              {/* APPROVE (only if not approved) */}

              {v.kyc_status !== "approved" && (

                <button
                  onClick={() => approveVendor(v.id)}
                  className="bg-primary text-white px-6 py-2 rounded-xl hover:bg-primaryHover transition font-semibold"
                >
                  Approve
                </button>

              )}



              {/* HOLD only if pending */}

              {v.kyc_status === "pending" && (

                <button
                  onClick={() => holdVendor(v.id)}
                  className="border border-warningText text-warningText px-6 py-2 rounded-xl hover:bg-warningText hover:text-white transition font-semibold"
                >
                  Hold
                </button>

              )}



              {/* DELETE always */}

              <button
                onClick={() => deleteVendor(v.id)}
                className="border border-dangerText text-dangerText px-6 py-2 rounded-xl hover:bg-dangerText hover:text-white transition font-semibold"
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}