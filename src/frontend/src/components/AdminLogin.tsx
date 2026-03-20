import { useEffect } from "react";
import type { Page } from "../App";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AdminLoginProps {
  onNavigate: (page: Page) => void;
}

export default function AdminLogin({ onNavigate }: AdminLoginProps) {
  const { login, isLoggingIn, identity, isInitializing } =
    useInternetIdentity();
  const { actor } = useActor();

  useEffect(() => {
    if (identity && actor) {
      actor
        .isCallerAdmin()
        .then((isAdmin) => {
          if (isAdmin) onNavigate("admin");
          else
            alert(
              "You are not authorized as an admin. Please contact the system administrator.",
            );
        })
        .catch(console.error);
    }
  }, [identity, actor, onNavigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center">
        <span className="text-3xl font-bold tracking-widest bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm block mb-6">
          ZENTRIX
        </span>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Portal</h2>
        <p className="text-gray-500 text-sm mb-8">
          Sign in with Internet Identity to access the admin dashboard
        </p>

        {isInitializing ? (
          <div className="flex justify-center py-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <button
            type="button"
            onClick={login}
            disabled={isLoggingIn}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-green-500 text-white font-bold text-lg hover:shadow-xl hover:shadow-blue-200 transition-all disabled:opacity-60"
          >
            {isLoggingIn ? "Connecting..." : "Login with Internet Identity"}
          </button>
        )}

        <p className="text-xs text-gray-400 mt-6">
          Internet Identity provides secure, private authentication without
          passwords.
        </p>

        <button
          type="button"
          onClick={() => onNavigate("landing")}
          className="mt-4 text-sm text-gray-400 hover:text-gray-600"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
