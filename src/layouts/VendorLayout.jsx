import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function VendorLayout() {
  return (
    <div className="flex min-h-screen bg-bgApp">

      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar role="vendor" />
      </div>

      {/* Main Section */}
      <div className="flex-1 flex flex-col">

        {/* Navbar */}
        <div className="sticky top-0 z-10 bg-bgApp">
          <Navbar />
        </div>

        {/* Content */}
        <div className="flex-1 p-10">
          <div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-8 animate-fade">
            <Outlet />
          </div>
        </div>

      </div>
    </div>
  );
}