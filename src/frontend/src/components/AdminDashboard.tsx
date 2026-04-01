import { Toaster } from "@/components/ui/sonner";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import {
  ApplicationStatus,
  type BlobFileRef,
  type DashboardStats,
  type JobApplication,
  type JobPosting,
  Variant_contract_partTime_fullTime,
} from "../backend";
import { useActor } from "../hooks/useActor";

interface AdminDashboardProps {
  onNavigate: (page: Page) => void;
}

type AdminTab = "dashboard" | "applications" | "positions";

const STATUS_OPTIONS = [
  {
    value: ApplicationStatus.pending,
    label: "Pending",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    value: ApplicationStatus.reviewing,
    label: "Reviewing",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    value: ApplicationStatus.shortlisted,
    label: "Shortlisted",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    value: ApplicationStatus.hired,
    label: "Hired",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    value: ApplicationStatus.rejected,
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-200",
  },
];

const JOB_TYPES = [
  { value: Variant_contract_partTime_fullTime.fullTime, label: "Full-Time" },
  { value: Variant_contract_partTime_fullTime.partTime, label: "Part-Time" },
  { value: Variant_contract_partTime_fullTime.contract, label: "Contract" },
];

type JobFormData = {
  title: string;
  department: string;
  location: string;
  jobType: Variant_contract_partTime_fullTime;
  description: string;
  requirements: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  isActive: boolean;
};

const emptyJobForm: JobFormData = {
  title: "",
  department: "",
  location: "",
  jobType: Variant_contract_partTime_fullTime.fullTime,
  description: "",
  requirements: "",
  salaryMin: "0",
  salaryMax: "0",
  salaryCurrency: "INR",
  isActive: true,
};

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getStatusOption(status: ApplicationStatus) {
  return STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];
}

const AVATAR_COLORS = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-teal-500",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ---- Sidebar nav icons (inline SVG) ----
function IconDashboard() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}
function IconApps() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );
}
function IconPositions() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}
function IconX() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { actor } = useActor();
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    "all",
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<ApplicationStatus>(
    ApplicationStatus.reviewing,
  );
  const [detailApp, setDetailApp] = useState<JobApplication | null>(null);
  const [detailNotes, setDetailNotes] = useState("");
  const [detailStatus, setDetailStatus] = useState<ApplicationStatus>(
    ApplicationStatus.pending,
  );
  const [savingDetail, setSavingDetail] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [jobModal, setJobModal] = useState<{ open: boolean; editId?: string }>({
    open: false,
  });
  const [jobForm, setJobForm] = useState<JobFormData>(emptyJobForm);
  const [jobError, setJobError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const [appsData, jobsData, statsData] = await Promise.all([
        actor.listAllApplications(),
        actor.getActiveJobs(),
        actor.getDashboardStats(),
      ]);
      setApps(appsData);
      setJobs(jobsData);
      setStats(statsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (!actor) return;
    actor
      .claimAdminWithPassword("N@m88000")
      .catch(() => {})
      .finally(() => {
        loadData();
      });
  }, [actor, loadData]);

  const filteredApps = apps.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.applicantName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.trackingId.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (
    trackingId: string,
    status: ApplicationStatus,
  ) => {
    if (!actor) return;
    await actor.claimAdminWithPassword("N@m88000").catch(() => {});
    try {
      await actor.updateApplicationStatus(trackingId, status, "");
      setApps((prev) =>
        prev.map((a) => (a.trackingId === trackingId ? { ...a, status } : a)),
      );
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status");
    }
  };

  const handleBulkUpdate = async () => {
    if (!actor || selected.size === 0) return;
    await actor.claimAdminWithPassword("N@m88000").catch(() => {});
    try {
      await actor.bulkUpdateStatus(Array.from(selected), bulkStatus);
      await loadData();
      setSelected(new Set());
      toast.success("Bulk status updated");
    } catch (e) {
      console.error(e);
      toast.error("Bulk update failed");
    }
  };

  const handleDeleteApp = async (trackingId: string) => {
    if (!actor || !confirm("Delete this application?")) return;
    await actor.claimAdminWithPassword("N@m88000").catch(() => {});
    try {
      await actor.deleteApplication(trackingId);
      setApps((prev) => prev.filter((a) => a.trackingId !== trackingId));
      toast.success("Application deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete application");
    }
  };

  const openDetail = (app: JobApplication) => {
    setDetailApp(app);
    setDetailNotes(app.adminNotes);
    setDetailStatus(app.status);
    setDetailError("");
  };

  const saveDetail = async () => {
    if (!actor || !detailApp) return;
    setSavingDetail(true);
    setDetailError("");
    await actor.claimAdminWithPassword("N@m88000").catch(() => {});
    try {
      await actor.updateApplicationStatus(
        detailApp.trackingId,
        detailStatus,
        detailNotes,
      );
      setApps((prev) =>
        prev.map((a) =>
          a.trackingId === detailApp.trackingId
            ? { ...a, status: detailStatus, adminNotes: detailNotes }
            : a,
        ),
      );
      setDetailApp(null);
      toast.success("Application updated");
    } catch (e) {
      console.error(e);
      setDetailError("Failed to save changes. Please try again.");
    } finally {
      setSavingDetail(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      "Tracking ID",
      "Name",
      "Email",
      "Phone",
      "Position",
      "Experience",
      "Status",
      "Applied At",
      "Notes",
    ];
    const rows = apps.map((a) => [
      a.trackingId,
      a.applicantName,
      a.email,
      a.phone,
      a.position,
      a.experience,
      a.status,
      new Date(Number(a.appliedAt) / 1_000_000).toLocaleDateString(),
      a.adminNotes,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const link = document.createElement("a");
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    link.download = `skiltrix-applications-${Date.now()}.csv`;
    link.click();
    toast.success("CSV exported");
  };

  const openJobModal = (id?: string) => {
    setJobError("");
    if (id) {
      const job = jobs.find((j) => j.id === id);
      if (job) {
        setJobForm({
          title: job.title,
          department: job.department,
          location: job.location,
          jobType: job.jobType,
          description: job.description,
          requirements: job.requirements,
          salaryMin: String(job.salary.min),
          salaryMax: String(job.salary.max),
          salaryCurrency: job.salary.currency,
          isActive: job.isActive,
        });
        setJobModal({ open: true, editId: id });
        return;
      }
    }
    setJobForm(emptyJobForm);
    setJobModal({ open: true });
  };

  const saveJob = async () => {
    if (!actor) return;
    setJobError("");
    await actor.claimAdminWithPassword("N@m88000").catch(() => {});
    const input = {
      id: jobModal.editId || "",
      title: jobForm.title,
      department: jobForm.department,
      location: jobForm.location,
      jobType: jobForm.jobType,
      description: jobForm.description,
      requirements: jobForm.requirements,
      salary: {
        min: BigInt(jobForm.salaryMin || 0),
        max: BigInt(jobForm.salaryMax || 0),
        currency: jobForm.salaryCurrency,
      },
      isActive: jobForm.isActive,
    };
    try {
      if (jobModal.editId) {
        await actor.updateJobPost(jobModal.editId, input);
      } else {
        await actor.createJobPost(input);
      }
      await loadData();
      setJobModal({ open: false });
      toast.success(jobModal.editId ? "Position updated" : "Position created");
    } catch (e) {
      console.error(e);
      setJobError("Failed to save position. Please try again.");
    }
  };

  const deleteJob = async (id: string) => {
    if (!actor || !confirm("Delete this position?")) return;
    await actor.claimAdminWithPassword("N@m88000").catch(() => {});
    try {
      await actor.deleteJobPost(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      toast.success("Position deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete position");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("skiltrix_admin");
    onNavigate("landing");
  };

  const navItems: {
    id: AdminTab;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    { id: "dashboard", label: "Dashboard", icon: <IconDashboard /> },
    {
      id: "applications",
      label: "Applications",
      icon: <IconApps />,
      count: apps.length,
    },
    {
      id: "positions",
      label: "Positions",
      icon: <IconPositions />,
      count: jobs.length,
    },
  ];

  const recentApps = [...apps]
    .sort((a, b) => Number(b.appliedAt) - Number(a.appliedAt))
    .slice(0, 5);

  const statCards = [
    {
      label: "Total Applications",
      value: stats ? Number(stats.totalApplications) : 0,
      icon: "👥",
      gradient: "from-indigo-500 to-violet-500",
    },
    {
      label: "Pending",
      value: stats ? Number(stats.pendingCount) : 0,
      icon: "⏳",
      gradient: "from-amber-400 to-orange-400",
    },
    {
      label: "Reviewing",
      value: apps.filter((a) => a.status === ApplicationStatus.reviewing)
        .length,
      icon: "🔍",
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      label: "Shortlisted",
      value: stats ? Number(stats.shortlistedCount) : 0,
      icon: "✅",
      gradient: "from-green-500 to-emerald-400",
    },
    {
      label: "Hired",
      value: stats ? Number(stats.hiredCount) : 0,
      icon: "🎉",
      gradient: "from-emerald-500 to-teal-400",
    },
    {
      label: "Active Jobs",
      value: stats ? Number(stats.totalActiveJobs) : 0,
      icon: "💼",
      gradient: "from-purple-500 to-pink-400",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Toaster position="top-right" />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          tabIndex={-1}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "#1e1b4b" }}
        data-ocid="admin.panel"
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center">
              <span className="text-white font-black text-xs">SK</span>
            </div>
            <div>
              <span
                className="font-black tracking-widest text-sm"
                style={{
                  background: "linear-gradient(135deg, #a5b4fc, #67e8f9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                SKILTRIX
              </span>
              <div className="text-[10px] text-indigo-300/70 leading-none">
                Admin Panel
              </div>
            </div>
          </div>
          <button
            type="button"
            className="lg:hidden text-white/60 hover:text-white"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <IconX />
          </button>
        </div>

        {/* Nav */}
        <nav
          className="flex-1 px-3 py-4 space-y-1"
          aria-label="Admin navigation"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setTab(item.id);
                setSidebarOpen(false);
              }}
              data-ocid={`admin.${item.id}.tab`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === item.id
                  ? "bg-gradient-to-r from-indigo-500/30 to-cyan-500/20 text-white border border-indigo-400/30"
                  : "text-indigo-200/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className={tab === item.id ? "text-cyan-300" : ""}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.count !== undefined && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    tab === item.id
                      ? "bg-cyan-400/20 text-cyan-300"
                      : "bg-white/10 text-indigo-300"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 pb-4 space-y-1 border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={() => onNavigate("landing")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-indigo-200/70 hover:text-white hover:bg-white/5 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Public Site
          </button>
          <button
            type="button"
            onClick={handleLogout}
            data-ocid="admin.logout.button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-300/70 hover:text-red-200 hover:bg-red-500/10 transition-all"
          >
            <IconLogout />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <IconMenu />
            </button>
            <div>
              <h1 className="font-bold text-gray-900 text-sm sm:text-base">
                {tab === "dashboard" && "Dashboard Overview"}
                {tab === "applications" && "Applications"}
                {tab === "positions" && "Manage Positions"}
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                {tab === "dashboard" && "Welcome back, Admin"}
                {tab === "applications" &&
                  `${filteredApps.length} total applications`}
                {tab === "positions" && `${jobs.length} active positions`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Online
            </span>
          </div>
        </header>

        {/* Scrollable content */}
        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6"
          data-ocid="admin.section"
        >
          {/* Loading skeleton */}
          {loading ? (
            <div data-ocid="admin.loading_state" className="space-y-4">
              {/* Stats skeleton */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {["s1", "s2", "s3", "s4", "s5", "s6"].map((sk) => (
                  <div
                    key={sk}
                    className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse"
                  >
                    <div className="h-8 w-12 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-16 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
              {/* Table skeleton */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {["r1", "r2", "r3"].map((sk) => (
                  <div
                    key={sk}
                    className="flex gap-4 px-6 py-4 border-b border-gray-50 animate-pulse"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-32 bg-gray-200 rounded" />
                      <div className="h-3 w-48 bg-gray-100 rounded" />
                    </div>
                    <div className="h-6 w-20 bg-gray-100 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {tab === "dashboard" && (
                <div className="space-y-6">
                  {/* Stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {statCards.map((s) => (
                      <div
                        key={s.label}
                        className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
                        data-ocid="admin.dashboard.card"
                      >
                        <div
                          className={`text-2xl mb-2 w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center`}
                        >
                          <span className="text-base">{s.icon}</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {s.value}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 leading-tight">
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Applications */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900 text-sm">
                          Recent Applications
                        </h2>
                        <button
                          type="button"
                          onClick={() => setTab("applications")}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                          data-ocid="admin.view_all.button"
                        >
                          View all →
                        </button>
                      </div>
                      {recentApps.length === 0 ? (
                        <div
                          className="py-12 text-center text-gray-400 text-sm"
                          data-ocid="admin.recent.empty_state"
                        >
                          No applications yet
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {recentApps.map((app, i) => {
                            const statusOpt = getStatusOption(app.status);
                            return (
                              <button
                                type="button"
                                key={app.trackingId}
                                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors w-full text-left"
                                onClick={() => openDetail(app)}
                                data-ocid={`admin.recent.item.${i + 1}`}
                              >
                                <div
                                  className={`w-9 h-9 rounded-full ${avatarColor(app.applicantName)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                                >
                                  {getInitials(app.applicantName)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm truncate">
                                    {app.applicantName}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {app.position}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusOpt.color}`}
                                  >
                                    {statusOpt.label}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {new Date(
                                      Number(app.appliedAt) / 1_000_000,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                      <h2 className="font-semibold text-gray-900 text-sm mb-4">
                        Quick Actions
                      </h2>
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={() => {
                            openJobModal();
                            setTab("positions");
                          }}
                          data-ocid="admin.add_position.button"
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all"
                        >
                          <span className="text-lg">+</span>
                          Add Position
                        </button>
                        <button
                          type="button"
                          onClick={exportCSV}
                          data-ocid="admin.export_csv.button"
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-semibold hover:bg-emerald-100 transition-colors"
                        >
                          <span className="text-lg">📥</span>
                          Export CSV
                        </button>
                        <button
                          type="button"
                          onClick={loadData}
                          data-ocid="admin.refresh.button"
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 text-gray-700 border border-gray-200 text-sm font-semibold hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-lg">🔄</span>
                          Refresh Data
                        </button>
                      </div>

                      <div className="mt-5 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400 mb-3">
                          Application Status
                        </p>
                        {STATUS_OPTIONS.map((s) => {
                          const count = apps.filter(
                            (a) => a.status === s.value,
                          ).length;
                          const total = apps.length || 1;
                          return (
                            <div key={s.value} className="mb-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600">{s.label}</span>
                                <span className="font-medium text-gray-900">
                                  {count}
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400 transition-all"
                                  style={{ width: `${(count / total) * 100}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Applications Tab */}
              {tab === "applications" && (
                <div>
                  {/* Toolbar */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                      <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search by name, email, tracking ID…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        data-ocid="admin.search_input"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(
                          e.target.value as ApplicationStatus | "all",
                        )
                      }
                      data-ocid="admin.status.select"
                      className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <option value="all">All Status</option>
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={exportCSV}
                      data-ocid="admin.export_csv.button"
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-700 hover:bg-gray-50 font-medium whitespace-nowrap"
                    >
                      Export CSV
                    </button>
                  </div>

                  {/* Bulk actions */}
                  {selected.size > 0 && (
                    <div className="flex flex-wrap items-center gap-3 mb-4 px-4 py-3 bg-indigo-50 rounded-xl border border-indigo-100">
                      <span className="text-sm text-indigo-700 font-medium">
                        {selected.size} selected
                      </span>
                      <select
                        value={bulkStatus}
                        onChange={(e) =>
                          setBulkStatus(e.target.value as ApplicationStatus)
                        }
                        data-ocid="admin.bulk_status.select"
                        className="px-3 py-1.5 rounded-lg border border-indigo-200 text-sm bg-white"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleBulkUpdate}
                        data-ocid="admin.bulk_apply.button"
                        className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
                      >
                        Apply to Selected
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelected(new Set())}
                        data-ocid="admin.bulk_clear.button"
                        className="px-4 py-1.5 rounded-lg bg-white text-gray-700 text-sm border border-gray-200"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  {/* Table */}
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table
                        className="w-full text-sm"
                        data-ocid="admin.applications.table"
                      >
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-4 py-3">
                              <input
                                type="checkbox"
                                data-ocid="admin.select_all.checkbox"
                                onChange={(e) =>
                                  setSelected(
                                    e.target.checked
                                      ? new Set(
                                          filteredApps.map((a) => a.trackingId),
                                        )
                                      : new Set(),
                                  )
                                }
                                className="rounded"
                              />
                            </th>
                            <th className="px-4 py-3 text-left text-gray-500 font-medium whitespace-nowrap">
                              #
                            </th>
                            <th className="px-4 py-3 text-left text-gray-500 font-medium whitespace-nowrap">
                              Applicant
                            </th>
                            <th className="px-4 py-3 text-left text-gray-500 font-medium whitespace-nowrap">
                              Tracking ID
                            </th>
                            <th className="px-4 py-3 text-left text-gray-500 font-medium whitespace-nowrap">
                              Contact
                            </th>
                            <th className="px-4 py-3 text-left text-gray-500 font-medium whitespace-nowrap">
                              Position
                            </th>
                            <th className="px-4 py-3 text-left text-gray-500 font-medium whitespace-nowrap">
                              Date
                            </th>
                            <th className="px-4 py-3 text-left text-gray-500 font-medium whitespace-nowrap">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-gray-500 font-medium whitespace-nowrap">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredApps.length === 0 ? (
                            <tr>
                              <td
                                colSpan={9}
                                className="px-4 py-12 text-center text-gray-400"
                                data-ocid="admin.applications.empty_state"
                              >
                                No applications found
                              </td>
                            </tr>
                          ) : (
                            filteredApps.map((app, i) => {
                              const statusOpt = getStatusOption(app.status);
                              return (
                                <tr
                                  key={app.trackingId}
                                  className="hover:bg-gray-50/80 hover:shadow-[inset_0_0_0_1px_#e0e7ff] transition-all"
                                  data-ocid={`admin.applications.row.${i + 1}`}
                                >
                                  <td className="px-4 py-3">
                                    <input
                                      type="checkbox"
                                      checked={selected.has(app.trackingId)}
                                      onChange={(e) => {
                                        const s = new Set(selected);
                                        e.target.checked
                                          ? s.add(app.trackingId)
                                          : s.delete(app.trackingId);
                                        setSelected(s);
                                      }}
                                      data-ocid={`admin.applications.checkbox.${i + 1}`}
                                      className="rounded"
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-gray-400">
                                    {i + 1}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2.5">
                                      <div
                                        className={`w-8 h-8 rounded-full ${avatarColor(app.applicantName)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                                      >
                                        {getInitials(app.applicantName)}
                                      </div>
                                      <span className="font-medium text-gray-900 whitespace-nowrap">
                                        {app.applicantName}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 font-mono text-xs text-indigo-600 whitespace-nowrap">
                                    {app.trackingId}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="text-gray-600 text-xs whitespace-nowrap">
                                      {app.email}
                                    </div>
                                    <div className="text-gray-400 text-xs whitespace-nowrap">
                                      {app.phone}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap text-xs">
                                    {app.position}
                                  </td>
                                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                                    {new Date(
                                      Number(app.appliedAt) / 1_000_000,
                                    ).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="relative group">
                                      <span
                                        className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-medium ${statusOpt.color} cursor-pointer`}
                                      >
                                        {statusOpt.label}
                                      </span>
                                      <select
                                        value={app.status}
                                        onChange={(e) =>
                                          handleStatusChange(
                                            app.trackingId,
                                            e.target.value as ApplicationStatus,
                                          )
                                        }
                                        data-ocid={`admin.applications.status.${i + 1}`}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full"
                                        aria-label="Change status"
                                      >
                                        {STATUS_OPTIONS.map((s) => (
                                          <option key={s.value} value={s.value}>
                                            {s.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex gap-2 whitespace-nowrap">
                                      <button
                                        type="button"
                                        onClick={() => openDetail(app)}
                                        data-ocid={`admin.applications.edit_button.${i + 1}`}
                                        className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium border border-indigo-100"
                                      >
                                        Details
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteApp(app.trackingId)
                                        }
                                        data-ocid={`admin.applications.delete_button.${i + 1}`}
                                        className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium border border-red-100"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Positions Tab */}
              {tab === "positions" && (
                <div>
                  <div className="flex justify-end mb-4">
                    <button
                      type="button"
                      onClick={() => openJobModal()}
                      data-ocid="admin.add_position.button"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-200 transition-all"
                    >
                      + Add Position
                    </button>
                  </div>
                  {jobs.length === 0 ? (
                    <div
                      className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100"
                      data-ocid="admin.positions.empty_state"
                    >
                      <div className="text-5xl mb-4">💼</div>
                      <p>No positions yet. Add one to get started.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {jobs.map((job, i) => {
                        const jobTypeLabel =
                          JOB_TYPES.find((t) => t.value === job.jobType)
                            ?.label ?? "Full-Time";
                        return (
                          <div
                            key={job.id}
                            className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                            data-ocid={`admin.positions.card.${i + 1}`}
                          >
                            {/* Gradient left accent + header */}
                            <div className="flex">
                              <div className="w-1 bg-gradient-to-b from-indigo-500 to-cyan-400 flex-shrink-0" />
                              <div className="flex-1 p-5">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 text-base truncate">
                                      {job.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
                                        {job.department}
                                      </span>
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-100">
                                        📍 {job.location}
                                      </span>
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100">
                                        {jobTypeLabel}
                                      </span>
                                    </div>
                                  </div>
                                  <span
                                    className={`ml-2 flex-shrink-0 text-xs px-2 py-1 rounded-full font-medium ${
                                      job.isActive
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-500"
                                    }`}
                                  >
                                    {job.isActive ? "Active" : "Inactive"}
                                  </span>
                                </div>

                                {/* Salary */}
                                <div className="flex items-center gap-1.5 mb-3">
                                  <span className="text-xs text-gray-400">
                                    Salary:
                                  </span>
                                  <span className="text-sm font-bold text-indigo-700">
                                    ₹{Number(job.salary.min).toLocaleString()} –
                                    ₹{Number(job.salary.max).toLocaleString()}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {job.salary.currency}
                                  </span>
                                </div>

                                <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                                  {job.description}
                                </p>

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openJobModal(job.id)}
                                    data-ocid={`admin.positions.edit_button.${i + 1}`}
                                    className="flex-1 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 font-medium border border-indigo-100 transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteJob(job.id)}
                                    data-ocid={`admin.positions.delete_button.${i + 1}`}
                                    className="flex-1 py-2 text-sm bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-medium border border-red-100 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {detailApp && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          tabIndex={-1}
          onClick={() => setDetailApp(null)}
          onKeyDown={(e) => e.key === "Escape" && setDetailApp(null)}
          data-ocid="admin.detail.modal"
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${avatarColor(detailApp.applicantName)} flex items-center justify-center text-white font-bold flex-shrink-0`}
                >
                  {getInitials(detailApp.applicantName)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {detailApp.applicantName}
                  </h3>
                  <p className="text-xs text-gray-500">{detailApp.position}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailApp(null)}
                data-ocid="admin.detail.close_button"
                className="text-gray-400 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-5 space-y-4">
              {detailError && (
                <div
                  className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
                  data-ocid="admin.detail.error_state"
                >
                  {detailError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-0.5">Tracking ID</p>
                  <p className="font-mono font-semibold text-indigo-600 text-xs">
                    {detailApp.trackingId}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-0.5">Experience</p>
                  <p className="font-medium text-gray-900 text-xs">
                    {detailApp.experience}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-0.5">Email</p>
                  <p className="text-gray-800 text-xs truncate">
                    {detailApp.email}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-0.5">Phone</p>
                  <p className="text-gray-800 text-xs">{detailApp.phone}</p>
                </div>
              </div>
              {detailApp.coverLetter && (
                <div>
                  <p className="text-gray-400 text-xs mb-1">Cover Letter</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">
                    {detailApp.coverLetter}
                  </p>
                </div>
              )}
              <DocumentViewer detailApp={detailApp} actor={actor} />
              <div>
                <label
                  htmlFor="detailStatus"
                  className="block text-xs text-gray-500 mb-1 font-medium"
                >
                  Status
                </label>
                <select
                  id="detailStatus"
                  value={detailStatus}
                  onChange={(e) =>
                    setDetailStatus(e.target.value as ApplicationStatus)
                  }
                  data-ocid="admin.detail.status.select"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="detailNotes"
                  className="block text-xs text-gray-500 mb-1 font-medium"
                >
                  Admin Notes
                </label>
                <textarea
                  id="detailNotes"
                  value={detailNotes}
                  onChange={(e) => setDetailNotes(e.target.value)}
                  rows={3}
                  data-ocid="admin.detail.textarea"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={saveDetail}
                  disabled={savingDetail}
                  data-ocid="admin.detail.save_button"
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-60"
                >
                  {savingDetail ? "Saving…" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setDetailApp(null)}
                  data-ocid="admin.detail.cancel_button"
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Modal */}
      {jobModal.open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          tabIndex={-1}
          onClick={() => setJobModal({ open: false })}
          onKeyDown={(e) => e.key === "Escape" && setJobModal({ open: false })}
          data-ocid="admin.job.modal"
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-bold text-gray-900">
                {jobModal.editId ? "Edit Position" : "Add New Position"}
              </h3>
              <button
                type="button"
                onClick={() => setJobModal({ open: false })}
                data-ocid="admin.job.close_button"
                className="text-gray-400 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-5 space-y-4">
              {jobError && (
                <div
                  className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
                  data-ocid="admin.job.error_state"
                >
                  {jobError}
                </div>
              )}
              {(
                [
                  ["title", "Job Title"],
                  ["department", "Department"],
                  ["location", "Location"],
                ] as [keyof JobFormData, string][]
              ).map(([key, label]) => (
                <div key={key}>
                  <label
                    htmlFor={key}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {label}
                  </label>
                  <input
                    id={key}
                    type="text"
                    value={String(jobForm[key])}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, [key]: e.target.value })
                    }
                    data-ocid={`admin.job.${key}.input`}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              ))}
              <div>
                <label
                  htmlFor="jobType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Job Type
                </label>
                <select
                  id="jobType"
                  value={jobForm.jobType}
                  onChange={(e) =>
                    setJobForm({
                      ...jobForm,
                      jobType: e.target
                        .value as Variant_contract_partTime_fullTime,
                    })
                  }
                  data-ocid="admin.job.type.select"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {JOB_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="jobDescription"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="jobDescription"
                  value={jobForm.description}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, description: e.target.value })
                  }
                  rows={3}
                  data-ocid="admin.job.description.textarea"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label
                  htmlFor="jobRequirements"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Requirements
                </label>
                <textarea
                  id="jobRequirements"
                  value={jobForm.requirements}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, requirements: e.target.value })
                  }
                  rows={3}
                  data-ocid="admin.job.requirements.textarea"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="salaryMin"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Min Salary
                  </label>
                  <input
                    id="salaryMin"
                    type="number"
                    value={jobForm.salaryMin}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, salaryMin: e.target.value })
                    }
                    data-ocid="admin.job.salary_min.input"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label
                    htmlFor="salaryMax"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Max Salary
                  </label>
                  <input
                    id="salaryMax"
                    type="number"
                    value={jobForm.salaryMax}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, salaryMax: e.target.value })
                    }
                    data-ocid="admin.job.salary_max.input"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label
                    htmlFor="salaryCurrency"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Currency
                  </label>
                  <input
                    id="salaryCurrency"
                    type="text"
                    value={jobForm.salaryCurrency}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, salaryCurrency: e.target.value })
                    }
                    data-ocid="admin.job.currency.input"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={jobForm.isActive}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, isActive: e.target.checked })
                  }
                  data-ocid="admin.job.active.checkbox"
                  className="rounded"
                />
                Active (visible to applicants)
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={saveJob}
                  data-ocid="admin.job.save_button"
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
                >
                  {jobModal.editId ? "Update Position" : "Create Position"}
                </button>
                <button
                  type="button"
                  onClick={() => setJobModal({ open: false })}
                  data-ocid="admin.job.cancel_button"
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- DocumentViewer Component ----
interface DocButtonProps {
  label: string;
  fileId: string;
  actor: {
    getFile: (id: string) => Promise<BlobFileRef>;
  } | null;
}

function DocButton({ label, fileId, actor }: DocButtonProps) {
  const [loading, setLoading] = useState<"preview" | "download" | null>(null);

  const handlePreview = async () => {
    if (!actor || !fileId) return;
    setLoading("preview");
    try {
      const ref = await actor.getFile(fileId);
      window.open(ref.blob.getDirectURL(), "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Failed to load document. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleDownload = async () => {
    if (!actor || !fileId) return;
    setLoading("download");
    try {
      const ref = await actor.getFile(fileId);
      const response = await fetch(ref.blob.getDirectURL());
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const ext = ref.fileType?.split("/")[1] || "file";
      a.download = `${label.replace(/\s+/g, "_")}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Failed to download document. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-2 group hover:border-indigo-300 hover:shadow-sm transition-all">
      <svg
        aria-hidden="true"
        className="w-4 h-4 text-indigo-500 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <span className="text-xs font-medium text-gray-700 flex-1 min-w-0 truncate">
        {label}
      </span>
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={handlePreview}
          disabled={loading !== null}
          title="Preview"
          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-50"
        >
          {loading === "preview" ? (
            <svg
              aria-hidden="true"
              className="w-3.5 h-3.5 animate-spin"
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
          ) : (
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={loading !== null}
          title="Download"
          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all disabled:opacity-50"
        >
          {loading === "download" ? (
            <svg
              aria-hidden="true"
              className="w-3.5 h-3.5 animate-spin"
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
          ) : (
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function DocumentViewer({
  detailApp,
  actor,
}: {
  detailApp: JobApplication;
  actor: { getFile: (id: string) => Promise<BlobFileRef> } | null;
}) {
  const docs: { label: string; fileId: string }[] = [
    detailApp.resumeFileId && {
      label: "Resume / CV",
      fileId: detailApp.resumeFileId,
    },
    detailApp.aadhaarFileId && {
      label: "Aadhaar Card",
      fileId: detailApp.aadhaarFileId,
    },
    detailApp.panFileId && { label: "PAN Card", fileId: detailApp.panFileId },
    detailApp.selfieFileId && {
      label: "Selfie",
      fileId: detailApp.selfieFileId,
    },
    detailApp.bankPassbookFileId && {
      label: "Bank Passbook",
      fileId: detailApp.bankPassbookFileId,
    },
    ...detailApp.additionalFileIds.map((id, i) =>
      id ? { label: `Additional Doc ${i + 1}`, fileId: id } : null,
    ),
  ].filter(Boolean) as { label: string; fileId: string }[];

  if (docs.length === 0) return null;

  return (
    <div>
      <p className="text-gray-400 text-xs mb-2 font-medium">
        Documents ({docs.length})
      </p>
      <div className="space-y-2">
        {docs.map((doc) => (
          <DocButton
            key={doc.fileId}
            label={doc.label}
            fileId={doc.fileId}
            actor={actor}
          />
        ))}
      </div>
    </div>
  );
}
