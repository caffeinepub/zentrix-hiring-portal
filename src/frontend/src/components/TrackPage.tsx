import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Page } from "../App";
import { ApplicationStatus, type JobApplication } from "../backend";
import { useActor } from "../hooks/useActor";

interface TrackPageProps {
  initialTrackingId: string;
  onNavigate: (page: Page) => void;
}

const statusSteps = [
  {
    key: ApplicationStatus.pending,
    label: "Application Received",
    description: "We got your application",
    icon: (
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    key: ApplicationStatus.reviewing,
    label: "Under Review",
    description: "Our team is reviewing",
    icon: (
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
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
  },
  {
    key: ApplicationStatus.shortlisted,
    label: "Shortlisted",
    description: "You made the cut!",
    icon: (
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
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    ),
  },
  {
    key: ApplicationStatus.hired,
    label: "Offer Extended",
    description: "Congratulations!",
    icon: (
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
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

const statusOrder = [
  ApplicationStatus.pending,
  ApplicationStatus.reviewing,
  ApplicationStatus.shortlisted,
  ApplicationStatus.hired,
];

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
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.97 0.02 245) 0%, oklch(0.98 0.01 165) 100%)",
      }}
    >
      {/* Hero Section */}
      <div className="brand-gradient py-16 px-4 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4 backdrop-blur-sm">
            <svg
              aria-hidden="true"
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Track Your Application
          </h1>
          <p className="text-white/80 text-lg max-w-md mx-auto">
            Enter your tracking ID to see real-time status updates
          </p>
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6 pb-16">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          type="button"
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-1.5 text-sm text-white/90 hover:text-white mb-4 font-medium"
          data-ocid="track.link"
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
          Back to Home
        </motion.button>

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-white p-6 mb-6"
        >
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Enter Tracking ID
          </h2>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                placeholder="e.g. SKX17092384723"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent font-mono text-sm bg-gray-50 focus:bg-white transition-all"
                style={
                  {
                    "--tw-ring-color": "oklch(0.52 0.22 245 / 0.3)",
                  } as React.CSSProperties
                }
                data-ocid="track.input"
              />
            </div>
            <button
              type="button"
              onClick={handleTrack}
              disabled={loading}
              className="px-6 py-3.5 rounded-xl text-white font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed brand-gradient whitespace-nowrap"
              data-ocid="track.primary_button"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Searching
                </span>
              ) : (
                "Track Status"
              )}
            </button>
          </div>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg"
                data-ocid="track.error_state"
              >
                <svg
                  aria-hidden="true"
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Result Card */}
        <AnimatePresence>
          {app && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {/* Applicant Details Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="brand-gradient px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {app.applicantName}
                    </h3>
                    <p className="text-white/75 text-sm mt-0.5">
                      {app.position}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                      isRejected
                        ? "bg-red-500/20 text-white border border-red-300/40"
                        : "bg-white/20 text-white border border-white/30"
                    }`}
                  >
                    {app.status}
                  </div>
                </div>
                <div className="px-6 py-4 grid grid-cols-3 gap-4 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Email</p>
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {app.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                    <p className="text-sm font-medium text-gray-700">
                      {app.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Applied On</p>
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(
                        Number(app.appliedAt) / 1_000_000,
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              {isRejected ? (
                <motion.div
                  initial={{ scale: 0.97 }}
                  animate={{ scale: 1 }}
                  className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 text-center"
                  data-ocid="track.card"
                >
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      aria-hidden="true"
                      className="w-8 h-8 text-red-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-bold text-red-700 text-lg mb-2">
                    Application Not Selected
                  </h4>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto">
                    Thank you for your interest in Skiltrix Academy. We
                    encourage you to keep growing and apply again for future
                    openings.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate("landing")}
                    className="mt-4 px-5 py-2 rounded-full border-2 border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
                  >
                    View Open Positions
                  </button>
                </motion.div>
              ) : (
                <div
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                  data-ocid="track.card"
                >
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
                    Application Progress
                  </h4>
                  <div className="relative">
                    {/* Connecting Line */}
                    <div
                      className="absolute top-6 left-6 right-6 h-0.5 bg-gray-100"
                      style={{
                        left: "calc(12.5% + 0px)",
                        right: "calc(12.5% + 0px)",
                      }}
                    >
                      <div
                        className="h-full transition-all duration-700 brand-gradient"
                        style={{
                          width: `${currentIdx >= 0 ? (currentIdx / (statusSteps.length - 1)) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between relative z-10">
                      {statusSteps.map((s, i) => {
                        const done = i <= currentIdx;
                        const active = i === currentIdx;
                        return (
                          <div
                            key={String(s.key)}
                            className="flex flex-col items-center flex-1"
                          >
                            <motion.div
                              animate={active ? { scale: [1, 1.1, 1] } : {}}
                              transition={{
                                repeat: Number.POSITIVE_INFINITY,
                                duration: 2,
                                repeatDelay: 1,
                              }}
                              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                                done
                                  ? "text-white shadow-md"
                                  : "bg-white border-2 border-gray-200 text-gray-300"
                              } ${active ? "shadow-lg" : ""}`}
                              style={
                                done
                                  ? {
                                      background:
                                        "linear-gradient(135deg, oklch(0.52 0.22 245), oklch(0.65 0.18 155))",
                                      boxShadow: active
                                        ? "0 0 0 4px oklch(0.52 0.22 245 / 0.2), 0 4px 12px oklch(0.52 0.22 245 / 0.3)"
                                        : undefined,
                                    }
                                  : {}
                              }
                            >
                              {done ? (
                                active ? (
                                  s.icon
                                ) : (
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
                                      strokeWidth={2.5}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )
                              ) : (
                                s.icon
                              )}
                            </motion.div>
                            <p
                              className={`text-xs mt-2.5 text-center font-semibold leading-tight max-w-[80px] ${
                                active
                                  ? "text-blue-600"
                                  : done
                                    ? "text-gray-600"
                                    : "text-gray-300"
                              }`}
                            >
                              {s.label}
                            </p>
                            <p
                              className={`text-[10px] mt-0.5 text-center leading-tight max-w-[80px] ${
                                active
                                  ? "text-blue-400"
                                  : done
                                    ? "text-gray-400"
                                    : "text-gray-200"
                              }`}
                            >
                              {s.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* HR Message */}
              {app.adminNotes && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center">
                      <svg
                        aria-hidden="true"
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-gray-800">
                      Message from HR
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed pl-10">
                    {app.adminNotes}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty hint */}
        {!app && !loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg
                aria-hidden="true"
                className="w-7 h-7 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">
              Your tracking ID was provided when you submitted your application
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
