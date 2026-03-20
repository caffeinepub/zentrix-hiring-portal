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
            className="flex items-center gap-2"
          >
            <img
              src="https://i.ibb.co/Z1BNhKFr/IMG-20260314-WA0060.jpg"
              width="160"
              height="40"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
              alt="Zentrix Solutions"
              className="h-9 w-auto object-contain"
            />
          </button>
          <div className="hidden md:flex items-center gap-8">
            <button
              type="button"
              onClick={() => onNavigate("landing")}
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => scrollTo("about")}
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => scrollTo("positions")}
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
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
            >
              Track Application
            </button>
            <button
              type="button"
              onClick={() => onNavigate("adminLogin")}
              className="ml-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-green-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-200 transition-all"
            >
              Admin Login
            </button>
          </div>
          <button
            type="button"
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
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
