import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

export default function CustomerLayout() {
  return (
    <div className="flex min-h-screen bg-bgApp">

      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar role="customer" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">

        {/* Navbar */}
        <div className="sticky top-0 z-10">
          <Navbar />
        </div>

        {/* Page Content */}
        <div className="flex-1 p-10">
          <div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-8 animate-fade min-h-[60vh]">
            <Outlet />
          </div>
        </div>

        {/* Footer */}
        <Footer />

      </div>
    </div>
  );
}