import { useEffect, useState } from "react";
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

  const Field = ({
    label,
    name,
    type = "text",
    required = false,
  }: {
    label: string;
    name: keyof FormData;
    type?: string;
    required?: boolean;
  }) => (
    <div>
      <label
        htmlFor={String(name)}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={String(name)}
        type={type}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className={`w-full px-4 py-3 rounded-xl border ${
          errors[name] ? "border-red-400 bg-red-50" : "border-gray-200"
        } focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
      />
      {errors[name] && (
        <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
      )}
    </div>
  );

  const FileField = ({
    label,
    fileKey,
    required = false,
  }: {
    label: string;
    fileKey: keyof Omit<DocFiles, "additional">;
    required?: boolean;
  }) => (
    <div>
      <label
        htmlFor={String(fileKey)}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={String(fileKey)}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) =>
          setDocs({ ...docs, [fileKey]: e.target.files?.[0] || null })
        }
        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
      />
      {docs[fileKey] && (
        <p className="text-xs text-green-600 mt-1">
          ✓ {(docs[fileKey] as File).name}
        </p>
      )}
      {fileKey === "resume" && errors.resume && (
        <p className="text-xs text-red-500 mt-1">{errors.resume}</p>
      )}
      {uploadProgress[fileKey] !== undefined &&
        uploadProgress[fileKey] < 100 && (
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${uploadProgress[fileKey]}%` }}
            />
          </div>
        )}
    </div>
  );

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
            Back to Positions
          </button>
        </div>

        {/* Steps */}
        <div className="flex items-center mb-8 gap-2">
          {(["Personal Info", "Documents", "Review"] as const).map(
            (label, i) => (
              <div
                key={label}
                className="flex items-center flex-1 last:flex-none"
              >
                <div
                  className={`flex items-center gap-2 ${i + 1 < step ? "text-green-600" : i + 1 === step ? "text-blue-600" : "text-gray-400"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                      i + 1 < step
                        ? "bg-green-600 border-green-600 text-white"
                        : i + 1 === step
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-300"
                    }`}
                  >
                    {i + 1 < step ? "✓" : i + 1}
                  </div>
                  <span className="text-xs font-semibold hidden sm:block">
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${i + 1 < step ? "bg-green-400" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ),
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900">
                Personal Information
              </h2>
              <Field label="Full Name" name="fullName" required />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field
                  label="Email Address"
                  name="email"
                  type="email"
                  required
                />
                <Field label="Mobile Number" name="phone" type="tel" required />
              </div>
              <div>
                <label
                  htmlFor="position"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Position Applied For <span className="text-red-500">*</span>
                </label>
                <select
                  id="position"
                  value={form.position}
                  onChange={(e) =>
                    setForm({ ...form, position: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl border ${errors.position ? "border-red-400" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select a position...</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.title}>
                      {j.title}
                    </option>
                  ))}
                </select>
                {errors.position && (
                  <p className="text-xs text-red-500 mt-1">{errors.position}</p>
                )}
              </div>
              <Field label="Years of Experience" name="experience" required />
              <div>
                <label
                  htmlFor="coverLetter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Cover Letter
                </label>
                <textarea
                  id="coverLetter"
                  value={form.coverLetter}
                  onChange={(e) =>
                    setForm({ ...form, coverLetter: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Tell us why you're a great fit..."
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900">
                Upload Documents
              </h2>
              <FileField label="Resume / CV" fileKey="resume" required />
              <FileField label="Aadhaar Card" fileKey="aadhaar" />
              <FileField label="PAN Card" fileKey="pan" />
              <FileField label="Selfie" fileKey="selfie" />
              <FileField label="Bank Passbook" fileKey="bankPassbook" />
              <div>
                <label
                  htmlFor="additionalDocs"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Additional Documents (Certificates, etc.)
                </label>
                <input
                  id="additionalDocs"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    setDocs({
                      ...docs,
                      additional: Array.from(e.target.files || []),
                    })
                  }
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
                />
                {docs.additional.length > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ {docs.additional.length} file(s) selected
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">
                Review & Submit
              </h2>
              <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>{" "}
                    <span className="font-medium text-gray-900 ml-2">
                      {form.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>{" "}
                    <span className="font-medium text-gray-900 ml-2">
                      {form.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>{" "}
                    <span className="font-medium text-gray-900 ml-2">
                      {form.phone}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Position:</span>{" "}
                    <span className="font-medium text-gray-900 ml-2">
                      {form.position}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Experience:</span>{" "}
                    <span className="font-medium text-gray-900 ml-2">
                      {form.experience}
                    </span>
                  </div>
                </div>
                {form.coverLetter && (
                  <div className="text-sm">
                    <span className="text-gray-500">Cover Letter:</span>
                    <p className="mt-1 text-gray-900">{form.coverLetter}</p>
                  </div>
                )}
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">
                  Uploaded Documents
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {docs.resume && <li>✓ Resume: {docs.resume.name}</li>}
                  {docs.aadhaar && <li>✓ Aadhaar: {docs.aadhaar.name}</li>}
                  {docs.pan && <li>✓ PAN: {docs.pan.name}</li>}
                  {docs.selfie && <li>✓ Selfie: {docs.selfie.name}</li>}
                  {docs.bankPassbook && (
                    <li>✓ Bank Passbook: {docs.bankPassbook.name}</li>
                  )}
                  {docs.additional.map((f) => (
                    <li key={`${f.name}-${f.size}`}>✓ Additional: {f.name}</li>
                  ))}
                </ul>
              </div>
              {submitting && (
                <div className="text-center py-4">
                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500 mt-2">
                    Uploading documents and submitting...
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                className="px-8 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold hover:shadow-lg transition-all"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
