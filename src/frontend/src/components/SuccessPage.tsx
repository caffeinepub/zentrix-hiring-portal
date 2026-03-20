import type { Page } from "../App";

interface SuccessPageProps {
  trackingId: string;
  onNavigate: (page: Page, opts?: { trackingId?: string }) => void;
}

export default function SuccessPage({
  trackingId,
  onNavigate,
}: SuccessPageProps) {
  const copyId = () => navigator.clipboard.writeText(trackingId);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-10">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              aria-hidden="true"
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Application Submitted!
          </h2>
          <p className="text-gray-500 mb-6">
            Your application has been received. We'll review it and get back to
            you within 2-3 weeks.
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 rounded-2xl p-4 mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Your Tracking ID
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl font-bold text-blue-700 font-mono">
                {trackingId}
              </span>
              <button
                type="button"
                onClick={copyId}
                className="text-blue-500 hover:text-blue-700"
                title="Copy"
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Save this ID to track your application status
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onNavigate("track", { trackingId })}
              className="flex-1 py-3 rounded-full bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold text-sm hover:shadow-lg transition-all"
            >
              Track Status
            </button>
            <button
              type="button"
              onClick={() => onNavigate("landing")}
              className="flex-1 py-3 rounded-full border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
