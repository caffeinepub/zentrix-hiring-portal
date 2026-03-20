import { useState } from "react";
import type { Page } from "../App";

interface NavbarProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    onNavigate("landing");
    setTimeout(
      () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            type="button"
            onClick={() => onNavigate("landing")}
            className="flex items-center"
            data-ocid="nav.link"
          >
            <span
              style={{
                background:
                  "linear-gradient(135deg, #d4a017, #f5c842, #b8860b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
              className="text-2xl font-black tracking-widest"
            >
              ZENTRIX
            </span>
          </button>
          <div className="hidden md:flex items-center gap-8">
            <button
              type="button"
              onClick={() => onNavigate("landing")}
              className={`text-sm font-medium transition-colors ${
                currentPage === "landing"
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
              data-ocid="nav.home.link"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => scrollTo("about")}
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              data-ocid="nav.about.link"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => scrollTo("positions")}
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              data-ocid="nav.positions.link"
            >
              Positions
            </button>
            <button
              type="button"
              onClick={() => onNavigate("track")}
              className={`text-sm font-medium transition-colors ${
                currentPage === "track"
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
              data-ocid="nav.track.link"
            >
              Track Application
            </button>
            <button
              type="button"
              onClick={() => onNavigate("adminLogin")}
              className="ml-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-green-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-200 transition-all"
              data-ocid="nav.admin_login.button"
            >
              Admin Login
            </button>
          </div>
          <button
            type="button"
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            data-ocid="nav.toggle"
          >
            <div className="w-5 h-0.5 bg-gray-600 mb-1" />
            <div className="w-5 h-0.5 bg-gray-600 mb-1" />
            <div className="w-5 h-0.5 bg-gray-600" />
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <button
            type="button"
            onClick={() => {
              onNavigate("landing");
              setMenuOpen(false);
            }}
            className="block w-full text-left text-sm font-medium text-gray-600"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => {
              scrollTo("about");
              setMenuOpen(false);
            }}
            className="block w-full text-left text-sm font-medium text-gray-600"
          >
            About
          </button>
          <button
            type="button"
            onClick={() => {
              scrollTo("positions");
              setMenuOpen(false);
            }}
            className="block w-full text-left text-sm font-medium text-gray-600"
          >
            Positions
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigate("track");
              setMenuOpen(false);
            }}
            className="block w-full text-left text-sm font-medium text-gray-600"
          >
            Track Application
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigate("adminLogin");
              setMenuOpen(false);
            }}
            className="block w-full text-left text-sm font-medium text-blue-600"
          >
            Admin Login
          </button>
        </div>
      )}
    </nav>
  );
}
