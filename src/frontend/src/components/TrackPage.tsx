import { useEffect, useState } from "react";
import type { Page } from "../App";
import { ApplicationStatus, type JobApplication } from "../backend";
import { useActor } from "../hooks/useActor";

interface TrackPageProps {
  initialTrackingId: string;
  onNavigate: (page: Page) => void;
}

const statusSteps = [
  { key: ApplicationStatus.pending, label: "Application Received", icon: "📩" },
  { key: ApplicationStatus.reviewing, label: "Under Review", icon: "🔍" },
  { key: ApplicationStatus.shortlisted, label: "Shortlisted", icon: "⭐" },
  { key: ApplicationStatus.hired, label: "Offer Extended", icon: "🎉" },
];

const statusOrder = [
  ApplicationStatus.pending,
  ApplicationStatus.reviewing,
  ApplicationStatus.shortlisted,
  ApplicationStatus.hired,
];

const statusColors: Record<ApplicationStatus, string> = {
  [ApplicationStatus.pending]: "bg-yellow-100 text-yellow-800",
  [ApplicationStatus.reviewing]: "bg-blue-100 text-blue-800",
  [ApplicationStatus.shortlisted]: "bg-green-100 text-green-800",
  [ApplicationStatus.hired]: "bg-emerald-100 text-emerald-800",
  [ApplicationStatus.rejected]: "bg-red-100 text-red-800",
};

export default function TrackPage({
  initialTrackingId,
  onNavigate,
}: TrackPageProps) {
  const { actor } = useActor();
  const [trackingId, setTrackingId] = useState(initialTrackingId);
  const [app, setApp] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialTrackingId && actor) {
      setTrackingId(initialTrackingId);
      setLoading(true);
      setError("");
      actor
        .getApplicationByTrackingId(initialTrackingId.trim())
        .then(setApp)
        .catch(() => setError("No application found with this tracking ID."))
        .finally(() => setLoading(false));
    }
  }, [initialTrackingId, actor]);

  const handleTrack = async () => {
    if (!trackingId.trim()) {
      setError("Please enter a tracking ID");
      return;
    }
    if (!actor) {
      setError("Loading... please wait");
      return;
    }
    setLoading(true);
    setError("");
    setApp(null);
    try {
      const result = await actor.getApplicationByTrackingId(trackingId.trim());
      setApp(result);
    } catch {
      setError(
        "No application found with this tracking ID. Please check and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const currentIdx = app ? statusOrder.indexOf(app.status) : -1;
  const isRejected = app?.status === ApplicationStatus.rejected;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => onNavigate("landing")}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            <svg
              aria-hidden="true"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Track Your Application
          </h1>
          <p className="text-gray-500 mt-2">
            Enter your tracking ID to check your application status
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              placeholder="Enter Tracking ID (e.g. ZTX...)"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <button
              type="button"
              onClick={handleTrack}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-60"
            >
              {loading ? "..." : "Track"}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>

        {app && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {app.applicantName}
                </h3>
                <p className="text-gray-500 text-sm">
                  {app.position} • Applied{" "}
                  {new Date(
                    Number(app.appliedAt) / 1_000_000,
                  ).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide ${statusColors[app.status]}`}
              >
                {app.status}
              </span>
            </div>

            {isRejected ? (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                <div className="text-4xl mb-2">😔</div>
                <p className="font-semibold text-red-800">
                  Application Not Selected
                </p>
                <p className="text-sm text-red-600 mt-1">
                  We appreciate your interest. We encourage you to apply again
                  in future openings.
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="flex justify-between relative z-10">
                  {statusSteps.map((s, i) => {
                    const done = i <= currentIdx;
                    const active = i === currentIdx;
                    return (
                      <div
                        key={s.key}
                        className="flex flex-col items-center flex-1"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-4 transition-all ${
                            done
                              ? "bg-blue-600 border-blue-600"
                              : "bg-white border-gray-200"
                          } ${active ? "shadow-lg shadow-blue-200 scale-110" : ""}`}
                        >
                          {done ? (
                            <svg
                              aria-hidden="true"
                              className="w-5 h-5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <span>{s.icon}</span>
                          )}
                        </div>
                        <p
                          className={`text-xs mt-2 text-center font-medium ${done ? "text-blue-700" : "text-gray-400"}`}
                        >
                          {s.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 z-0">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{
                      width: `${currentIdx >= 0 ? (currentIdx / (statusSteps.length - 1)) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {app.adminNotes && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 uppercase mb-1">
                  Message from HR
                </p>
                <p className="text-sm text-gray-700">{app.adminNotes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
