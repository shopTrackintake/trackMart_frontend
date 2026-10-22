import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col">
      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar role="admin" />

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col md:ml-64 min-w-0">
          <div className="sticky top-0 z-30">
            <Navbar />
          </div>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}