import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function VendorLayout() {
  return (
    <div className="flex min-h-screen bg-bgApp">

      {/* Sidebar */}
      <Sidebar role="vendor" />

      {/* Main Section */}
      <div className="flex-1 flex flex-col md:ml-64">

        {/* Navbar */}
        <div className="sticky top-0 z-10 bg-bgApp">
          <Navbar />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-10">
          <div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-4 md:p-8">
            <Outlet />
          </div>
        </div>

      </div>
    </div>
  );
}