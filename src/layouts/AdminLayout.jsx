import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-bgApp">

      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar role="admin" />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">

        {/* Top Navbar */}
        <div className="sticky top-0 z-10">
          <Navbar />
        </div>

        {/* Page Content */}
        <div className="flex-1 p-10">
          <div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-8 animate-fade">
            <Outlet />
          </div>
        </div>
<Footer/>
      </div>
      
    </div>
  );
}