import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

export default function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bgApp">
      {/* Sticky Navbar (Single unified navigation) */}
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}