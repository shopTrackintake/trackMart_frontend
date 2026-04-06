import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bgApp">

      {/* HEADER */}
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">

        <div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-4 sm:p-6 md:p-8 min-h-[60vh]">
          <Outlet />
        </div>

      </main>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}