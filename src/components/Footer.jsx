export default function Footer() {
  return (
    <footer className="bg-surface border-t border-default py-6">
      <div className="max-w-7xl mx-auto px-6 text-center text-muted text-sm">
        © {new Date().getFullYear()} IntakeMart. All rights reserved.
      </div>
    </footer>
  );
}