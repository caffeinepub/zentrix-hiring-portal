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

const benefits = [
  {
    title: "Competitive Salary",
    desc: "Industry-best compensation packages with performance bonuses.",
    icon: "💰",
    color: "from-yellow-400 to-orange-400",
    bg: "bg-yellow-50",
  },
  {
    title: "Remote Flexibility",
    desc: "Hybrid and remote options to support work-life balance.",
    icon: "🏡",
    color: "from-blue-400 to-cyan-400",
    bg: "bg-blue-50",
  },
  {
    title: "Learning & Growth",
    desc: "Access to training, certifications, and career development programs.",
    icon: "📚",
    color: "from-purple-400 to-indigo-400",
    bg: "bg-purple-50",
  },
  {
    title: "Health Benefits",
    desc: "Comprehensive health insurance for you and your family.",
    icon: "🏥",
    color: "from-red-400 to-pink-400",
    bg: "bg-red-50",
  },
  {
    title: "Great Culture",
    desc: "Collaborative, inclusive culture that values every voice.",
    icon: "🤝",
    color: "from-green-400 to-teal-400",
    bg: "bg-green-50",
  },
  {
    title: "Impactful Work",
    desc: "Work on projects that make a real difference in the world.",
    icon: "🌍",
    color: "from-blue-500 to-green-500",
    bg: "bg-teal-50",
  },
];

const aboutCards = [
  {
    title: "Our Mission",
    desc: "To empower businesses through cutting-edge technology solutions that drive real growth and sustainable value.",
    icon: "🎯",
    borderColor: "border-t-blue-500",
    iconBg: "bg-blue-100",
    tagline: "Drive real growth",
  },
  {
    title: "Our Vision",
    desc: "To become the most trusted technology partner for businesses of all sizes across the globe.",
    icon: "🔭",
    borderColor: "border-t-green-500",
    iconBg: "bg-green-100",
    tagline: "Trusted globally",
  },
  {
    title: "Our Values",
    desc: "Innovation, integrity, collaboration, and excellence are at the core of everything we do at Zentrix.",
    icon: "💎",
    borderColor: "border-t-purple-500",
    iconBg: "bg-purple-100",
    tagline: "Excellence first",
  },
];

function JobSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-5 w-24 bg-gray-200 rounded-full" />
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
      </div>
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-1/2 bg-gray-200 rounded mb-3" />
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-5/6 bg-gray-200 rounded" />
      </div>
      <div className="h-10 w-full bg-gray-200 rounded-full" />
    </div>
  );
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const { actor, isFetching } = useActor();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  useEffect(() => {
    if (actor && !isFetching) {
      setJobsLoading(true);
      actor
        .getActiveJobs()
        .then((result) => {
          setJobs(result);
        })
        .catch(console.error)
        .finally(() => setJobsLoading(false));
    }
  }, [actor, isFetching]);

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
        {/* Floating decoration */}
        <div className="absolute top-12 right-12 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-8 right-32 w-40 h-40 rounded-full bg-green-300/10 blur-2xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 relative">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
              Now Hiring
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 tracking-tight">
              Build Your Career at
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-yellow-200">
                Zentrix Solutions
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-xl">
              Join a team of innovators shaping the future of technology.
              Explore exciting opportunities and grow with us.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => onNavigate("form")}
                className="px-8 py-3.5 bg-white text-blue-700 font-bold rounded-full hover:shadow-2xl hover:shadow-blue-900/30 transition-all transform hover:-translate-y-0.5 text-sm"
                data-ocid="hero.primary_button"
              >
                Apply Now →
              </button>
              <button
                type="button"
                onClick={() => onNavigate("track")}
                className="px-8 py-3.5 border-2 border-white/60 text-white font-semibold rounded-full hover:bg-white/10 transition-all text-sm"
                data-ocid="hero.secondary_button"
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Open Positions",
                value: jobs.length > 0 ? jobs.length.toString() : "10+",
                icon: "💼",
                gradient: "from-blue-500 to-blue-600",
              },
              {
                label: "Team Members",
                value: "200+",
                icon: "👥",
                gradient: "from-green-500 to-emerald-600",
              },
              {
                label: "Years of Excellence",
                value: "5+",
                icon: "⭐",
                gradient: "from-yellow-400 to-orange-500",
              },
              {
                label: "Hiring Rate",
                value: "95%",
                icon: "📈",
                gradient: "from-purple-500 to-indigo-600",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all group"
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div
                  className={`text-3xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 mt-1 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 text-blue-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-3">
              About Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
              Who We Are
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-base">
              A leading technology company driving digital transformation across
              industries with innovation and integrity.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aboutCards.map((card) => (
              <div
                key={card.title}
                className={`bg-white rounded-2xl p-8 border-t-4 ${card.borderColor} shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group`}
              >
                <div
                  className={`w-14 h-14 ${card.iconBg} rounded-2xl flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition-transform`}
                >
                  {card.icon}
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  {card.tagline}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
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
          <div className="text-center mb-14">
            <span className="inline-block bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 text-blue-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-3">
              Benefits
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
              Why Join Zentrix?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              We invest in your growth, wellbeing, and career at every step.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((item) => (
              <div
                key={item.title}
                className="flex gap-4 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group bg-white"
              >
                <div
                  className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform`}
                >
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
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
            <span className="inline-block bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 text-blue-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-3">
              Careers
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
              Open Positions
            </h2>
            <p className="text-gray-500 text-sm">
              Find the role that's right for you.
            </p>
          </div>

          {!jobsLoading && jobs.length > 1 && (
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
                  data-ocid="positions.filter.tab"
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          {jobsLoading ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              data-ocid="positions.loading_state"
            >
              <JobSkeleton />
              <JobSkeleton />
              <JobSkeleton />
            </div>
          ) : filteredJobs.length === 0 ? (
            <div
              className="text-center py-20"
              data-ocid="positions.empty_state"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                💼
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Positions Coming Soon
              </h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">
                We're growing fast! New openings are coming. Check back soon or
                send us your profile.
              </p>
              <button
                type="button"
                onClick={() => onNavigate("form")}
                className="mt-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-green-500 text-white text-sm font-semibold hover:shadow-lg transition-all"
              >
                Submit Your Profile
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job, idx) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                  data-ocid={`positions.item.${idx + 1}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {job.department}
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
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
                  <h3 className="text-lg font-black text-gray-900 mb-2">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                    <svg
                      aria-hidden="true"
                      className="w-4 h-4 shrink-0"
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
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
                    {job.description}
                  </p>
                  {(job.salary.min > 0n || job.salary.max > 0n) && (
                    <div className="flex items-center gap-1 text-sm font-bold text-blue-700 mb-4 bg-blue-50 px-3 py-1.5 rounded-lg">
                      <span>💰</span>
                      <span>
                        {job.salary.currency}{" "}
                        {Number(job.salary.min).toLocaleString()} –{" "}
                        {Number(job.salary.max).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => onNavigate("form", { position: job.title })}
                    className="w-full py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-green-500 text-white text-sm font-bold hover:shadow-lg hover:shadow-blue-200 transition-all"
                    data-ocid={`positions.item.${idx + 1}`}
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
            <span className="inline-block bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 text-blue-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-3">
              FAQ
            </span>
            <h2 className="text-3xl font-black text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-200 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === faq.q ? null : faq.q)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <svg
                    aria-hidden="true"
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 shrink-0 ml-4 ${
                      openFaq === faq.q ? "rotate-180" : ""
                    }`}
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
                  <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                    <div className="pt-3">{faq.a}</div>
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
