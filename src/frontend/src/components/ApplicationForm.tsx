import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Page } from "../App";
import { ExternalBlob, type JobPosting } from "../backend";
import { useActor } from "../hooks/useActor";

interface ApplicationFormProps {
  initialPosition: string;
  onNavigate: (page: Page) => void;
  onSuccess: (trackingId: string) => void;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  coverLetter: string;
}

interface DocFiles {
  resume: File | null;
  aadhaar: File | null;
  pan: File | null;
  selfie: File | null;
  bankPassbook: File | null;
  additional: File[];
}

const initialForm: FormData = {
  fullName: "",
  email: "",
  phone: "",
  position: "",
  experience: "",
  coverLetter: "",
};
const initialDocs: DocFiles = {
  resume: null,
  aadhaar: null,
  pan: null,
  selfie: null,
  bankPassbook: null,
  additional: [],
};

const STEPS = [
  {
    label: "Personal Info",
    icon: (
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
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    label: "Documents",
    icon: (
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    label: "Review",
    icon: (
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
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
  },
];

export default function ApplicationForm({
  initialPosition,
  onNavigate,
  onSuccess,
}: ApplicationFormProps) {
  const { actor } = useActor();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    ...initialForm,
    position: initialPosition,
  });
  const [docs, setDocs] = useState<DocFiles>(initialDocs);
  const [errors, setErrors] = useState<Partial<FormData & { resume: string }>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );

  useEffect(() => {
    if (actor) actor.getActiveJobs().then(setJobs).catch(console.error);
  }, [actor]);

  const validateStep1 = () => {
    const errs: Partial<FormData> = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
      errs.email = "Valid email is required";
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone))
      errs.phone = "Valid 10-digit mobile number required";
    if (!form.position) errs.position = "Please select a position";
    if (!form.experience.trim()) errs.experience = "Experience is required";
    return errs;
  };

  const validateStep2 = () => {
    const errs: Partial<{ resume: string }> = {};
    if (!docs.resume) errs.resume = "Resume is required";
    return errs;
  };

  const goNext = () => {
    if (step === 1) {
      const e = validateStep1();
      if (Object.keys(e).length > 0) {
        setErrors(e);
        return;
      }
    }
    if (step === 2) {
      const e = validateStep2();
      if (Object.keys(e).length > 0) {
        setErrors(e);
        return;
      }
    }
    setErrors({});
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const uploadFile = async (file: File, key: string): Promise<string> => {
    if (!actor || !file) return "";
    const bytes = new Uint8Array(await file.arrayBuffer());
    const fileId = `${key}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
      setUploadProgress((p) => ({ ...p, [key]: pct }));
    });
    await actor.uploadFile(fileId, blob, file.type);
    return fileId;
  };

  const handleSubmit = async () => {
    if (!actor) return;
    setSubmitting(true);
    try {
      const resumeFileId = await uploadFile(docs.resume!, "resume");
      const aadhaarFileId = docs.aadhaar
        ? await uploadFile(docs.aadhaar, "aadhaar")
        : "";
      const panFileId = docs.pan ? await uploadFile(docs.pan, "pan") : "";
      const selfieFileId = docs.selfie
        ? await uploadFile(docs.selfie, "selfie")
        : "";
      const bankPassbookFileId = docs.bankPassbook
        ? await uploadFile(docs.bankPassbook, "bank")
        : "";
      const additionalFileIds = await Promise.all(
        docs.additional.map((f, i) => uploadFile(f, `additional_${i}`)),
      );
      const result = await actor.submitApplication({
        applicantName: form.fullName,
        email: form.email,
        phone: form.phone,
        position: form.position,
        experience: form.experience,
        coverLetter: form.coverLetter,
        resumeFileId,
        aadhaarFileId,
        panFileId,
        selfieFileId,
        bankPassbookFileId,
        additionalFileIds,
      });
      onSuccess(result.trackingId);
    } catch (e) {
      console.error(e);
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.97 0.02 245) 0%, oklch(0.98 0.01 165) 100%)",
      }}
    >
      {/* Header */}
      <div className="brand-gradient py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-4 font-medium transition-colors"
            data-ocid="application_form.link"
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
            Back to Positions
          </button>
          <h1 className="text-2xl font-bold text-white">
            Apply at Skiltrix Academy
          </h1>
          <p className="text-white/70 text-sm mt-1">
            Complete the form below to submit your application
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 pb-16">
        {/* Step Indicator */}
        <div className="bg-white rounded-2xl shadow-sm border border-white p-4 mb-5">
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <div
                key={s.label}
                className="flex items-center flex-1 last:flex-none"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                      i + 1 < step
                        ? "text-white"
                        : i + 1 === step
                          ? "text-white"
                          : "bg-gray-100 text-gray-400"
                    }`}
                    style={
                      i + 1 <= step
                        ? {
                            background:
                              "linear-gradient(135deg, oklch(0.52 0.22 245), oklch(0.65 0.18 155))",
                          }
                        : {}
                    }
                  >
                    {i + 1 < step ? (
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
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      s.icon
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p
                      className={`text-xs font-bold leading-none ${
                        i + 1 === step
                          ? "text-gray-800"
                          : i + 1 < step
                            ? "text-green-600"
                            : "text-gray-400"
                      }`}
                    >
                      {s.label}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Step {i + 1}
                    </p>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 rounded-full transition-all ${
                      i + 1 < step ? "" : "bg-gray-100"
                    }`}
                    style={
                      i + 1 < step
                        ? {
                            background:
                              "linear-gradient(to right, oklch(0.52 0.22 245), oklch(0.65 0.18 155))",
                          }
                        : {}
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            {step === 1 && (
              <Step1
                form={form}
                setForm={setForm}
                errors={errors}
                jobs={jobs}
              />
            )}
            {step === 2 && (
              <Step2
                docs={docs}
                setDocs={setDocs}
                errors={errors}
                uploadProgress={uploadProgress}
              />
            )}
            {step === 3 && (
              <Step3 form={form} docs={docs} submitting={submitting} />
            )}

            {/* Navigation */}
            <div className="px-6 pb-6 flex gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 sm:flex-none sm:w-32 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
                  data-ocid="application_form.secondary_button"
                >
                  ← Back
                </button>
              ) : (
                <div />
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all brand-gradient"
                  data-ocid="application_form.primary_button"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all brand-gradient disabled:opacity-60 disabled:cursor-not-allowed"
                  data-ocid="application_form.submit_button"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
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
                      Uploading & Submitting...
                    </span>
                  ) : (
                    "Submit Application 🚀"
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---- Step 1: Personal Info ----
function Step1({
  form,
  setForm,
  errors,
  jobs,
}: {
  form: FormData;
  setForm: (f: FormData) => void;
  errors: Partial<FormData>;
  jobs: JobPosting[];
}) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center brand-gradient">
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
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Personal Information
          </h2>
          <p className="text-xs text-gray-400">Tell us about yourself</p>
        </div>
      </div>

      {/* Full Name */}
      <FormField
        label="Full Name"
        icon={
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        }
        required
        error={errors.fullName}
      >
        <input
          id="fullName"
          type="text"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          placeholder="Your full legal name"
          className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
            errors.fullName
              ? "border-red-300 bg-red-50"
              : "border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400"
          }`}
          data-ocid="application_form.input"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField
          label="Email Address"
          icon={
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          }
          required
          error={errors.email}
        >
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
              errors.email
                ? "border-red-300 bg-red-50"
                : "border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400"
            }`}
          />
        </FormField>

        <FormField
          label="Mobile Number"
          icon={
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
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          }
          required
          error={errors.phone}
        >
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="10-digit mobile number"
            className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
              errors.phone
                ? "border-red-300 bg-red-50"
                : "border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400"
            }`}
          />
        </FormField>
      </div>

      {/* Position */}
      <FormField
        label="Position Applied For"
        icon={
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
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        }
        required
        error={errors.position}
      >
        <select
          id="position"
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
          className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
            errors.position
              ? "border-red-300 bg-red-50"
              : "border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400"
          }`}
          data-ocid="application_form.select"
        >
          <option value="">Select a position...</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.title}>
              {j.title}
            </option>
          ))}
        </select>
      </FormField>

      {/* Experience */}
      <FormField
        label="Years of Experience"
        icon={
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        required
        error={errors.experience}
      >
        <input
          id="experience"
          type="text"
          value={form.experience}
          onChange={(e) => setForm({ ...form, experience: e.target.value })}
          placeholder="e.g. 2 years, Fresher"
          className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
            errors.experience
              ? "border-red-300 bg-red-50"
              : "border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400"
          }`}
        />
      </FormField>

      {/* Cover Letter */}
      <FormField
        label="Cover Letter"
        icon={
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        }
      >
        <textarea
          id="coverLetter"
          value={form.coverLetter}
          onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
          rows={4}
          placeholder="Tell us why you're a great fit for this role..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 text-sm transition-all focus:outline-none resize-none"
          data-ocid="application_form.textarea"
        />
      </FormField>
    </div>
  );
}

// ---- Step 2: Documents ----
function Step2({
  docs,
  setDocs,
  errors,
  uploadProgress,
}: {
  docs: DocFiles;
  setDocs: (d: DocFiles) => void;
  errors: Partial<{ resume: string }>;
  uploadProgress: Record<string, number>;
}) {
  const docFields: {
    label: string;
    key: keyof Omit<DocFiles, "additional">;
    required?: boolean;
    accept: string;
    hint: string;
  }[] = [
    {
      label: "Resume / CV",
      key: "resume",
      required: true,
      accept: ".pdf,.doc,.docx",
      hint: "PDF, DOC (Max 10MB)",
    },
    {
      label: "Aadhaar Card",
      key: "aadhaar",
      accept: ".pdf,.jpg,.jpeg,.png",
      hint: "PDF or Image",
    },
    {
      label: "PAN Card",
      key: "pan",
      accept: ".pdf,.jpg,.jpeg,.png",
      hint: "PDF or Image",
    },
    {
      label: "Selfie (Passport Size)",
      key: "selfie",
      accept: ".jpg,.jpeg,.png",
      hint: "JPG, PNG",
    },
    {
      label: "Bank Passbook",
      key: "bankPassbook",
      accept: ".pdf,.jpg,.jpeg,.png",
      hint: "PDF or Image",
    },
  ];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center brand-gradient">
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
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Upload Documents</h2>
          <p className="text-xs text-gray-400">
            Resume is required. Others are optional.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {docFields.map((field) => (
          <UploadBox
            key={field.key}
            label={field.label}
            fileKey={field.key}
            required={field.required}
            accept={field.accept}
            hint={field.hint}
            file={docs[field.key] as File | null}
            error={field.key === "resume" ? errors.resume : undefined}
            progress={uploadProgress[field.key]}
            onChange={(f) => setDocs({ ...docs, [field.key]: f })}
          />
        ))}

        {/* Additional docs - full width */}
        <div className="sm:col-span-2">
          <AdditionalUploadBox
            files={docs.additional}
            onChange={(files) => setDocs({ ...docs, additional: files })}
          />
        </div>
      </div>
    </div>
  );
}

function UploadBox({
  label,
  fileKey,
  required,
  accept,
  hint,
  file,
  error,
  progress,
  onChange,
}: {
  label: string;
  fileKey: string;
  required?: boolean;
  accept: string;
  hint: string;
  file: File | null;
  error?: string;
  progress?: number;
  onChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <label
        htmlFor={fileKey}
        className="block text-xs font-semibold text-gray-600 mb-1.5"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) onChange(f);
        }}
        className={`w-full relative cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all ${
          error
            ? "border-red-300 bg-red-50"
            : file
              ? "border-green-300 bg-green-50"
              : dragging
                ? "border-blue-400 bg-blue-50"
                : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50"
        }`}
      >
        <input
          ref={inputRef}
          id={fileKey}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          data-ocid="application_form.upload_button"
        />
        {file ? (
          <div className="flex items-center gap-2 justify-center">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <svg
                aria-hidden="true"
                className="w-3.5 h-3.5 text-white"
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
            <div className="text-left min-w-0">
              <p className="text-xs font-semibold text-green-700 truncate max-w-[120px]">
                {file.name}
              </p>
              <p className="text-[10px] text-green-500">Click to replace</p>
            </div>
          </div>
        ) : (
          <div>
            <svg
              aria-hidden="true"
              className="w-6 h-6 text-gray-300 mx-auto mb-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-xs font-medium text-gray-500">Click to upload</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>
          </div>
        )}
        {progress !== undefined && progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-xl overflow-hidden">
            <div
              className="h-full brand-gradient transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function AdditionalUploadBox({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label
        htmlFor="additionalDocs"
        className="block text-xs font-semibold text-gray-600 mb-1.5"
      >
        Additional Documents{" "}
        <span className="text-gray-400 font-normal">(Certificates, etc.)</span>
      </label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full cursor-pointer rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50 p-4 transition-all text-left"
      >
        <input
          ref={inputRef}
          id="additionalDocs"
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => onChange(Array.from(e.target.files || []))}
          data-ocid="application_form.upload_button"
        />
        {files.length > 0 ? (
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {files.slice(0, 3).map((f, i) => (
                <div
                  key={`${f.name}-${i}`}
                  className="w-8 h-8 rounded-lg bg-blue-100 border-2 border-white flex items-center justify-center"
                >
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4 text-blue-600"
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
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-green-700">
                {files.length} file{files.length > 1 ? "s" : ""} selected
              </p>
              <p className="text-[10px] text-gray-400">Click to change</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <svg
              aria-hidden="true"
              className="w-6 h-6 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <div>
              <p className="text-xs font-medium text-gray-500">
                Add certificates, other documents
              </p>
              <p className="text-[10px] text-gray-400">
                PDF, JPG, PNG — multiple files allowed
              </p>
            </div>
          </div>
        )}
      </button>
    </div>
  );
}

// ---- Step 3: Review ----
function Step3({
  form,
  docs,
  submitting,
}: { form: FormData; docs: DocFiles; submitting: boolean }) {
  const reviewSections = [
    {
      title: "Personal Details",
      icon: (
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      fields: [
        { label: "Full Name", value: form.fullName },
        { label: "Email", value: form.email },
        { label: "Phone", value: form.phone },
        { label: "Position", value: form.position },
        { label: "Experience", value: form.experience },
      ],
    },
  ];

  const uploadedDocs = [
    docs.resume && { label: "Resume / CV", name: docs.resume.name },
    docs.aadhaar && { label: "Aadhaar Card", name: docs.aadhaar.name },
    docs.pan && { label: "PAN Card", name: docs.pan.name },
    docs.selfie && { label: "Selfie", name: docs.selfie.name },
    docs.bankPassbook && {
      label: "Bank Passbook",
      name: docs.bankPassbook.name,
    },
    ...docs.additional.map((f) => ({ label: "Additional", name: f.name })),
  ].filter(Boolean) as { label: string; name: string }[];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center brand-gradient">
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
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Review & Submit</h2>
          <p className="text-xs text-gray-400">
            Please verify your details before submitting
          </p>
        </div>
      </div>

      {reviewSections.map((section) => (
        <div
          key={section.title}
          className="rounded-xl border border-gray-100 overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
            <span className="text-gray-500">{section.icon}</span>
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              {section.title}
            </h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-3">
            {section.fields.map((f) => (
              <div key={f.label}>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                  {f.label}
                </p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">
                  {f.value || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {form.coverLetter && (
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              Cover Letter
            </h3>
          </div>
          <p className="p-4 text-sm text-gray-700 leading-relaxed">
            {form.coverLetter}
          </p>
        </div>
      )}

      {/* Documents */}
      <div className="rounded-xl border border-blue-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-b border-blue-100">
          <svg
            aria-hidden="true"
            className="w-4 h-4 text-blue-500"
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
          <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wide">
            Documents ({uploadedDocs.length})
          </h3>
        </div>
        <div className="p-4 space-y-2">
          {uploadedDocs.map((d, i) => (
            <div key={`${d.name}-${i}`} className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg
                  aria-hidden="true"
                  className="w-3 h-3 text-green-600"
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
              <div>
                <span className="text-xs font-semibold text-gray-500">
                  {d.label}:
                </span>
                <span className="text-xs text-gray-700 ml-1">{d.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {submitting && (
        <div className="text-center py-4">
          <div className="inline-flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center">
              <svg
                aria-hidden="true"
                className="w-5 h-5 text-white animate-spin"
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
            </div>
            <p className="text-sm font-semibold text-gray-700">
              Uploading documents...
            </p>
            <p className="text-xs text-gray-400">
              Please wait while we securely upload your files
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Reusable FormField Wrapper ----
function FormField({
  label,
  icon,
  required,
  error,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={String(label).toLowerCase().replace(/\s+/g, "_")}
        className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5"
      >
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <svg
            aria-hidden="true"
            className="w-3 h-3"
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
        </p>
      )}
    </div>
  );
}
