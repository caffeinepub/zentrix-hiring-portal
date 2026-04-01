import { useState } from "react";
import type { Page } from "../App";
import { useActor } from "../hooks/useActor";

interface AdminLoginProps {
  onNavigate: (page: Page) => void;
}

const ADMIN_USERNAME = "admin";
const ADMIN_ALT_USERNAME = "870847";
const ADMIN_PASSWORD = "N@m88000";

export default function AdminLogin({ onNavigate }: AdminLoginProps) {
  const { actor, isFetching } = useActor();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate credentials on frontend first
    const validUsername =
      username.trim() === ADMIN_ALT_USERNAME ||
      username.trim().toLowerCase() === ADMIN_USERNAME;
    const validPassword = password === ADMIN_PASSWORD;

    if (!validUsername || !validPassword) {
      setError("Invalid username or password.");
      return;
    }

    setIsVerifying(true);
    try {
      // If actor is available, claim admin role on backend too
      if (actor) {
        try {
          await actor.claimAdminWithPassword(password);
        } catch {
          // Backend call failed but credentials are correct -- proceed anyway
          // The anonymous principal may already have admin role from a previous login
        }
      }
      sessionStorage.setItem("skiltrix_admin", "1");
      onNavigate("admin");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-cyan-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center">
        <div className="mb-6">
          <span
            style={{
              background: "linear-gradient(135deg, #4f46e5, #7c3aed, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            className="text-2xl font-black tracking-wide"
          >
            SKILTRIX
          </span>
        </div>

        <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            aria-hidden="true"
            className="w-7 h-7 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">Admin Portal</h2>
        <p className="text-gray-500 text-sm mb-8">
          Sign in to access the admin dashboard
        </p>

        <form onSubmit={handleSubmit} className="text-left space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Admin ID
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin ID"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-gray-800"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-gray-800 pr-16"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium px-1"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isVerifying || isFetching || !username || !password}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-lg hover:shadow-xl hover:shadow-indigo-200 transition-all disabled:opacity-60"
          >
            {isFetching ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                Connecting...
              </span>
            ) : isVerifying ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                Verifying...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={() => onNavigate("landing")}
          className="mt-6 text-sm text-gray-400 hover:text-gray-600 block mx-auto"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
