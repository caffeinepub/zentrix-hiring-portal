import { useState } from "react";
import AdminDashboard from "./components/AdminDashboard";
import AdminLogin from "./components/AdminLogin";
import ApplicationForm from "./components/ApplicationForm";
import LandingPage from "./components/LandingPage";
import Navbar from "./components/Navbar";
import SuccessPage from "./components/SuccessPage";
import TrackPage from "./components/TrackPage";

export type Page =
  | "landing"
  | "form"
  | "success"
  | "track"
  | "adminLogin"
  | "admin";

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [submittedTrackingId, setSubmittedTrackingId] = useState("");

  const navigate = (
    p: Page,
    opts?: { position?: string; trackingId?: string },
  ) => {
    if (opts?.position) setSelectedPosition(opts.position);
    if (opts?.trackingId) setTrackingId(opts.trackingId);
    setPage(p);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-white">
      {page !== "admin" && page !== "adminLogin" && (
        <Navbar onNavigate={navigate} currentPage={page} />
      )}
      {page === "landing" && <LandingPage onNavigate={navigate} />}
      {page === "form" && (
        <ApplicationForm
          initialPosition={selectedPosition}
          onNavigate={navigate}
          onSuccess={(id) => {
            setSubmittedTrackingId(id);
            navigate("success");
          }}
        />
      )}
      {page === "success" && (
        <SuccessPage trackingId={submittedTrackingId} onNavigate={navigate} />
      )}
      {page === "track" && (
        <TrackPage initialTrackingId={trackingId} onNavigate={navigate} />
      )}
      {page === "adminLogin" && <AdminLogin onNavigate={navigate} />}
      {page === "admin" && <AdminDashboard onNavigate={navigate} />}
    </div>
  );
}
