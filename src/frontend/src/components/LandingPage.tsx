import { useEffect, useState } from "react";
import type { Page } from "../App";
import {
  type JobPosting,
  Variant_contract_partTime_fullTime,
} from "../backend";
import { useActor } from "../hooks/useActor";
import Footer from "./Footer";

interface LandingPageProps {
  onNavigate: (page: Page, opts?: { position?: string }) => void;
}

const faqs = [
  {
    q: "How do I apply for a position?",
    a: "Click 'Apply Now' on any job listing or use the Apply button in the navigation. Fill in the 3-step form with your details and documents.",
  },
  {
    q: "How can I track my application status?",
    a: "Use the 'Track Application' page and enter your Tracking ID (format: ZTX...) to view your current status.",
  },
  {
    q: "What documents are required?",
    a: "Resume (required), Aadhaar Front & Back, PAN Card, Selfie, and Bank Passbook. Additional certificates are optional.",
  },
  {
    q: "How long does the hiring process take?",
    a: "Typically 2-3 weeks from application to final decision, depending on the role and number of applicants.",
  },
  {
    q: "Can I apply for multiple positions?",
    a: "Yes, you can submit separate applications for different positions.",
  },
];

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const { actor } = useActor();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  useEffect(() => {
    if (actor) {
      actor.getActiveJobs().then(setJobs).catch(console.error);
    }
  }, [actor]);

  const departments = [
    "All",
    ...Array.from(new Set(jobs.map((j) => j.department))),
  ];
  const filteredJobs =
    activeFilter === "All"
      ? jobs
      : jobs.filter((j) => j.department === activeFilter);

  const jobTypeLabel = (jt: Variant_contract_partTime_fullTime) => {
    if (jt === Variant_contract_partTime_fullTime.fullTime) return "Full-Time";
    if (jt === Variant_contract_partTime_fullTime.partTime) return "Part-Time";
    return "Contract";
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="max-w-3xl">
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
              Now Hiring
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Build Your Career at
              <br />
              <span className="text-green-300">Zentrix Solutions</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join a team of innovators shaping the future of technology.
              Explore exciting opportunities and grow with us.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => onNavigate("form")}
                className="px-8 py-3 bg-white text-blue-700 font-bold rounded-full hover:shadow-xl hover:shadow-blue-900/30 transition-all transform hover:-translate-y-0.5"
              >
                Apply Now
              </button>
              <button
                type="button"
                onClick={() => onNavigate("track")}
                className="px-8 py-3 border-2 border-white/60 text-white font-semibold rounded-full hover:bg-white/10 transition-all"
              >
                Track Application
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                label: "Open Positions",
                value: jobs.length > 0 ? jobs.length.toString() : "10+",
              },
              { label: "Team Members", value: "200+" },
              { label: "Years of Excellence", value: "5+" },
              { label: "Hiring Rate", value: "95%" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-green-50 border border-blue-100 hover:shadow-md transition-shadow"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              About Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Who We Are
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Leading technology company driving digital transformation across
              industries.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Our Mission",
                desc: "To empower businesses through cutting-edge technology solutions that drive real growth and sustainable value.",
                icon: "🎯",
              },
              {
                title: "Our Vision",
                desc: "To become the most trusted technology partner for businesses of all sizes across the globe.",
                icon: "🔭",
              },
              {
                title: "Our Values",
                desc: "Innovation, integrity, collaboration, and excellence are at the core of everything we do at Zentrix.",
                icon: "💎",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-2xl p-8 border-t-4 border-blue-500 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {card.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              Benefits
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Join Zentrix?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Competitive Salary",
                desc: "Industry-best compensation packages with performance bonuses.",
                icon: "💰",
              },
              {
                title: "Remote Flexibility",
                desc: "Hybrid and remote options to support work-life balance.",
                icon: "🏡",
              },
              {
                title: "Learning & Growth",
                desc: "Access to training, certifications, and career development programs.",
                icon: "📚",
              },
              {
                title: "Health Benefits",
                desc: "Comprehensive health insurance for you and your family.",
                icon: "🏥",
              },
              {
                title: "Great Culture",
                desc: "Collaborative, inclusive culture that values every voice.",
                icon: "🤝",
              },
              {
                title: "Impactful Work",
                desc: "Work on projects that make a real difference in the world.",
                icon: "🌍",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-4 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="text-3xl shrink-0">{item.icon}</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="positions" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              Careers
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Open Positions
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {departments.map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => setActiveFilter(d)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === d
                    ? "bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          {filteredJobs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">💼</div>
              <p className="text-lg">
                No positions available right now. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {job.department}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        job.jobType ===
                        Variant_contract_partTime_fullTime.fullTime
                          ? "bg-green-50 text-green-700"
                          : job.jobType ===
                              Variant_contract_partTime_fullTime.partTime
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-purple-50 text-purple-700"
                      }`}
                    >
                      {jobTypeLabel(job.jobType)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {job.location}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                    {job.description}
                  </p>
                  {(job.salary.min > 0n || job.salary.max > 0n) && (
                    <div className="text-sm font-semibold text-blue-700 mb-4">
                      {job.salary.currency}{" "}
                      {Number(job.salary.min).toLocaleString()} –{" "}
                      {Number(job.salary.max).toLocaleString()}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => onNavigate("form", { position: job.title })}
                    className="w-full py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-green-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-200 transition-all"
                  >
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              FAQ
            </span>
            <h2 className="text-3xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="border border-gray-200 rounded-2xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === faq.q ? null : faq.q)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-gray-800 hover:bg-gray-50"
                >
                  {faq.q}
                  <svg
                    aria-hidden="true"
                    className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === faq.q ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openFaq === faq.q && (
                  <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
