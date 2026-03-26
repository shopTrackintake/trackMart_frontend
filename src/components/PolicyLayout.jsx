import { useNavigate } from "react-router-dom";

export default function PolicyLayout({ title, children }) {
  const navigate = useNavigate();

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 pt-4 pb-10">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="mb-2 text-sm text-muted hover:text-black dark:hover:text-white transition"
      >
        ← Back
      </button>

      {/* HEADING */}
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-black dark:text-white">
        {title}
      </h1>

      {/* DATE */}
      <p className="text-sm text-muted text-center mb-6">
        Last updated: March 2026
      </p>

      {/* CONTENT */}
      <div className="space-y-8">
        {children}
      </div>

    </div>
  );
}