import { useCallback, useEffect, useState } from "react";
import type { Page } from "../App";
import {
  ApplicationStatus,
  type DashboardStats,
  type JobApplication,
  type JobPosting,
  Variant_contract_partTime_fullTime,
} from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AdminDashboardProps {
  onNavigate: (page: Page) => void;
}

type AdminTab = "applications" | "positions";

const STATUS_OPTIONS = [
  {
    value: ApplicationStatus.pending,
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: ApplicationStatus.reviewing,
    label: "Reviewing",
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: ApplicationStatus.shortlisted,
    label: "Shortlisted",
    color: "bg-green-100 text-green-800",
  },
  {
    value: ApplicationStatus.hired,
    label: "Hired",
    color: "bg-emerald-100 text-emerald-800",
  },
  {
    value: ApplicationStatus.rejected,
    label: "Rejected",
    color: "bg-red-100 text-red-800",
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

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { actor } = useActor();
  const { clear } = useInternetIdentity();
  const [tab, setTab] = useState<AdminTab>("applications");
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
  const [jobModal, setJobModal] = useState<{ open: boolean; editId?: string }>({
    open: false,
  });
  const [jobForm, setJobForm] = useState<JobFormData>(emptyJobForm);

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
    loadData();
  }, [loadData]);

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
    try {
      await actor.updateApplicationStatus(trackingId, status, "");
      setApps((prev) =>
        prev.map((a) => (a.trackingId === trackingId ? { ...a, status } : a)),
      );
      if (stats) setStats({ ...stats });
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkUpdate = async () => {
    if (!actor || selected.size === 0) return;
    try {
      await actor.bulkUpdateStatus(Array.from(selected), bulkStatus);
      await loadData();
      setSelected(new Set());
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteApp = async (trackingId: string) => {
    if (!actor || !confirm("Delete this application?")) return;
    try {
      await actor.deleteApplication(trackingId);
      setApps((prev) => prev.filter((a) => a.trackingId !== trackingId));
    } catch (e) {
      console.error(e);
    }
  };

  const openDetail = (app: JobApplication) => {
    setDetailApp(app);
    setDetailNotes(app.adminNotes);
    setDetailStatus(app.status);
  };

  const saveDetail = async () => {
    if (!actor || !detailApp) return;
    setSavingDetail(true);
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
    } catch (e) {
      console.error(e);
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
    link.download = `zentrix-applications-${Date.now()}.csv`;
    link.click();
  };

  const openJobModal = (id?: string) => {
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
    } catch (e) {
      console.error(e);
      alert("Failed to save position.");
    }
  };

  const deleteJob = async (id: string) => {
    if (!actor || !confirm("Delete this position?")) return;
    try {
      await actor.deleteJobPost(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    clear();
    onNavigate("landing");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-blue-700 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-widest bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
              ZENTRIX
            </span>
            <div>
              <span className="font-bold">Zentrix Solutions</span>
              <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                Admin
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate("landing")}
              className="text-sm text-white/80 hover:text-white"
            >
              ← Public Site
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              {
                label: "Total",
                value: Number(stats.totalApplications),
                color: "from-blue-50 to-blue-100",
                text: "text-blue-700",
              },
              {
                label: "Pending",
                value: Number(stats.pendingCount),
                color: "from-yellow-50 to-yellow-100",
                text: "text-yellow-700",
              },
              {
                label: "Shortlisted",
                value: Number(stats.shortlistedCount),
                color: "from-green-50 to-green-100",
                text: "text-green-700",
              },
              {
                label: "Hired",
                value: Number(stats.hiredCount),
                color: "from-emerald-50 to-emerald-100",
                text: "text-emerald-700",
              },
              {
                label: "Reviewing",
                value: apps.filter(
                  (a) => a.status === ApplicationStatus.reviewing,
                ).length,
                color: "from-indigo-50 to-indigo-100",
                text: "text-indigo-700",
              },
              {
                label: "Active Jobs",
                value: Number(stats.totalActiveJobs),
                color: "from-purple-50 to-purple-100",
                text: "text-purple-700",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 text-center border border-white`}
              >
                <div className={`text-3xl font-bold ${s.text}`}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTab("applications")}
            className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${tab === "applications" ? "bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"}`}
          >
            Applications ({apps.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("positions")}
            className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${tab === "positions" ? "bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"}`}
          >
            Manage Positions ({jobs.length})
          </button>
        </div>

        {/* Applications Tab */}
        {tab === "applications" && (
          <div>
            {/* Controls */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-wrap gap-3 items-center">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, tracking ID..."
                className="flex-1 min-w-48 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as ApplicationStatus | "all")
                }
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                onClick={loadData}
                className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200"
              >
                ↻ Refresh
              </button>
              <button
                type="button"
                onClick={exportCSV}
                className="px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100"
              >
                Export CSV
              </button>
            </div>

            {/* Bulk Actions */}
            {selected.size > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 mb-4 flex flex-wrap gap-3 items-center">
                <span className="text-sm text-blue-700 font-medium">
                  {selected.size} selected
                </span>
                <select
                  value={bulkStatus}
                  onChange={(e) =>
                    setBulkStatus(e.target.value as ApplicationStatus)
                  }
                  className="px-3 py-2 rounded-lg border border-blue-200 text-sm"
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
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold"
                >
                  Apply to Selected
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          onChange={(e) =>
                            setSelected(
                              e.target.checked
                                ? new Set(filteredApps.map((a) => a.trackingId))
                                : new Set(),
                            )
                          }
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-gray-500 font-medium whitespace-nowrap">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-gray-500 font-medium whitespace-nowrap">
                        Tracking ID
                      </th>
                      <th className="px-4 py-3 text-left text-gray-500 font-medium whitespace-nowrap">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-gray-500 font-medium whitespace-nowrap">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-gray-500 font-medium whitespace-nowrap">
                        Phone
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
                          colSpan={10}
                          className="px-4 py-12 text-center text-gray-400"
                        >
                          No applications found
                        </td>
                      </tr>
                    ) : (
                      filteredApps.map((app, i) => (
                        <tr
                          key={app.trackingId}
                          className="hover:bg-gray-50 transition-colors"
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
                            />
                          </td>
                          <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                          <td className="px-4 py-3 font-mono text-xs text-blue-600 whitespace-nowrap">
                            {app.trackingId}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                            {app.applicantName}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {app.email}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {app.phone}
                          </td>
                          <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                            {app.position}
                          </td>
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                            {new Date(
                              Number(app.appliedAt) / 1_000_000,
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={app.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  app.trackingId,
                                  e.target.value as ApplicationStatus,
                                )
                              }
                              className="px-2 py-1 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => openDetail(app)}
                                className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium"
                              >
                                Details
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteApp(app.trackingId)}
                                className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
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
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold text-sm hover:shadow-lg transition-all"
              >
                + Add Position
              </button>
            </div>
            {jobs.length === 0 ? (
              <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                <div className="text-5xl mb-4">💼</div>
                <p>No positions yet. Add one to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-500">
                          {job.department} · {job.location}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${job.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {job.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {job.description}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openJobModal(job.id)}
                        className="flex-1 py-2 text-sm bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteJob(job.id)}
                        className="flex-1 py-2 text-sm bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailApp && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          tabIndex={-1}
          onClick={() => setDetailApp(null)}
          onKeyDown={(e) => e.key === "Escape" && setDetailApp(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Application Details</h3>
              <button
                type="button"
                onClick={() => setDetailApp(null)}
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Tracking ID</p>
                  <p className="font-mono font-semibold text-blue-600">
                    {detailApp.trackingId}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Name</p>
                  <p className="font-semibold">{detailApp.applicantName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Email</p>
                  <p>{detailApp.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Phone</p>
                  <p>{detailApp.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Position</p>
                  <p>{detailApp.position}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Experience</p>
                  <p>{detailApp.experience}</p>
                </div>
              </div>
              {detailApp.coverLetter && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Cover Letter</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
                    {detailApp.coverLetter}
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-500 text-xs mb-1">Documents</p>
                <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
                  {detailApp.resumeFileId && (
                    <p className="text-blue-600">📄 Resume uploaded</p>
                  )}
                  {detailApp.aadhaarFileId && (
                    <p className="text-blue-600">📄 Aadhaar uploaded</p>
                  )}
                  {detailApp.panFileId && (
                    <p className="text-blue-600">📄 PAN uploaded</p>
                  )}
                  {detailApp.selfieFileId && (
                    <p className="text-blue-600">📄 Selfie uploaded</p>
                  )}
                  {detailApp.bankPassbookFileId && (
                    <p className="text-blue-600">📄 Bank Passbook uploaded</p>
                  )}
                  {detailApp.additionalFileIds.map((id, i) => (
                    <p key={id || `additional-${i}`} className="text-blue-600">
                      📄 Additional doc {i + 1} uploaded
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <label
                  htmlFor="detailStatus"
                  className="block text-xs text-gray-500 mb-1"
                >
                  Status
                </label>
                <select
                  id="detailStatus"
                  value={detailStatus}
                  onChange={(e) =>
                    setDetailStatus(e.target.value as ApplicationStatus)
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
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
                  className="block text-xs text-gray-500 mb-1"
                >
                  Admin Notes
                </label>
                <textarea
                  id="detailNotes"
                  value={detailNotes}
                  onChange={(e) => setDetailNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Internal notes..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={saveDetail}
                  disabled={savingDetail}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl font-semibold text-sm disabled:opacity-60"
                >
                  {savingDetail ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setDetailApp(null)}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm"
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
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">
                {jobModal.editId ? "Edit Position" : "Add New Position"}
              </h3>
              <button
                type="button"
                onClick={() => setJobModal({ open: false })}
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              {(
                [
                  ["Job Title", "title"],
                  ["Department", "department"],
                  ["Location", "location"],
                ] as [string, keyof JobFormData][]
              ).map(([label, key]) => (
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
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
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
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
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
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={jobForm.isActive}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, isActive: e.target.checked })
                  }
                  className="rounded"
                />
                Active (visible to applicants)
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={saveJob}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
                >
                  {jobModal.editId ? "Update Position" : "Create Position"}
                </button>
                <button
                  type="button"
                  onClick={() => setJobModal({ open: false })}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm"
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
