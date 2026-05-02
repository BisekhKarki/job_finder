"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { baseurl } from "@/lib/baseurl";

type Company = {
  company_name: string;
  slug: string;
  website: string;
  description: string;
  location: string;
  logo: string | null;
  created_at: string;
};

const Icon = {
  ArrowLeft: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  ArrowRight: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  MapPin: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Link: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  Calendar: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Edit: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  ),
  Share: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  ExternalLink: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Check: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

function formatJoinDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function MetaPill({
  icon,
  children,
  href,
}: {
  icon: ReactNode;
  children: ReactNode;
  href?: string;
}) {
  const cls =
    "inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors";

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        <span className="text-slate-400">{icon}</span>
        <span className="truncate max-w-50">{children}</span>
        <span className="text-slate-400">
          <Icon.ExternalLink />
        </span>
      </a>
    );
  }
  return (
    <span className={cls}>
      <span className="text-slate-400">{icon}</span>
      {children}
    </span>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
          {label}
        </p>
        <p className="text-sm text-slate-800 wrap-break-words">{value}</p>
      </div>
    </div>
  );
}

export default function CompanyProfile({
  company,
  isOwner = true,
}: {
  company: Company | null;
  isOwner?: boolean;
}) {
  const [following, setFollowing] = useState(false);

  if (!company) {
    return null;
  }

  const initials = company.company_name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const websiteHost = company.website
    ? company.website.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "";

  const joinedLabel = formatJoinDate(company.created_at);

  return (
    <div className="min-h-screen bg-white text-slate-900 relative overflow-x-hidden">
      {/* Dot grid background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(15,23,42,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      {/* Top glow */}
      <div
        className="fixed -top-40 left-1/2 -translate-x-1/2 w-175 h-105 rounded-full pointer-events-none z-0 opacity-30 blur-3xl"
        style={{
          background: "radial-gradient(ellipse, #93c5fd 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-5 py-10 pb-24">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/home"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <Icon.ArrowLeft />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Icon.Share />
              Share
            </button>
            {isOwner && (
              <Link
                href={`/company/${company.slug}/edit`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <Icon.Edit />
                Edit profile
              </Link>
            )}
          </div>
        </div>

        {/* Hero card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm shadow-slate-200/40 overflow-hidden mb-6">
          {/* Cover banner */}
          <div
            className="h-28 sm:h-36 relative"
            style={{
              background:
                "linear-gradient(135deg, #dbeafe 0%, #eff6ff 50%, #f5f3ff 100%)",
            }}
          >
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(59,130,246,0.18) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
              aria-hidden="true"
            />
          </div>

          {/* Hero body */}
          <div className="px-6 sm:px-8 pb-7 -mt-12 sm:-mt-14 relative">
            {/* Logo */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border-4 border-white shadow-md ring-1 ring-slate-200/80 overflow-hidden flex items-center justify-center mb-4">
              {company.logo ? (
                <img
                  src={`${baseurl}${company.logo}`}
                  alt={`${company.company_name} logo`}
                  className="w-full h-full object-contain bg-white"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {initials}
                  </span>
                </div>
              )}
            </div>

            {/* Name + actions row */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                  {company.company_name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <MetaPill icon={<Icon.MapPin />}>{company.location}</MetaPill>
                  {company.website && (
                    <MetaPill icon={<Icon.Link />} href={company.website}>
                      {websiteHost}
                    </MetaPill>
                  )}
                  <MetaPill icon={<Icon.Calendar />}>
                    Joined {joinedLabel}
                  </MetaPill>
                </div>
              </div>

              {!isOwner && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setFollowing((v) => !v)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      following
                        ? "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20"
                    }`}
                  >
                    {following ? (
                      <>
                        <Icon.Check />
                        Following
                      </>
                    ) : (
                      "Follow"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column — About */}
          <div className="lg:col-span-2">
            <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm shadow-slate-200/40">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                About
              </h2>
              {company.description ? (
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {company.description}
                </p>
              ) : (
                <p className="text-sm text-slate-400 italic">
                  {isOwner
                    ? "No description yet. Add one to help people learn about your company."
                    : "No description yet."}
                </p>
              )}
            </section>
          </div>

          {/* Right column / sidebar */}
          <aside className="space-y-6">
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-200/40">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                Details
              </h2>
              <div className="divide-y divide-slate-100">
                <DetailRow
                  icon={<Icon.MapPin />}
                  label="Headquarters"
                  value={company.location}
                />
                <DetailRow
                  icon={<Icon.Link />}
                  label="Website"
                  value={
                    company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                      >
                        {websiteHost}
                        <Icon.ExternalLink />
                      </a>
                    ) : (
                      ""
                    )
                  }
                />
                <DetailRow
                  icon={<Icon.Calendar />}
                  label="Joined"
                  value={joinedLabel}
                />
              </div>
            </section>

            {/* Owner: edit CTA. Visitor: contact CTA. */}
            {isOwner ? (
              <section
                className="rounded-2xl p-6 border border-blue-100 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-50 pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(59,130,246,0.1) 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }}
                  aria-hidden="true"
                />
                <div className="relative">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600 mb-2">
                    Your profile
                  </p>
                  <h3 className="text-base font-semibold text-slate-900 mb-1">
                    Keep your profile fresh
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Update your details so visitors see the latest about your
                    company.
                  </p>
                  <Link
                    href={`/home/company/${company.slug}/update`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all"
                  >
                    <Icon.Edit />
                    Edit profile
                  </Link>
                </div>
              </section>
            ) : (
              <section
                className="rounded-2xl p-6 border border-blue-100 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-50 pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(59,130,246,0.1) 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }}
                  aria-hidden="true"
                />
                <div className="relative">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600 mb-2">
                    Get in touch
                  </p>
                  <h3 className="text-base font-semibold text-slate-900 mb-1">
                    Reach out to {company.company_name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Visit their website to learn more.
                  </p>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all"
                    >
                      Visit website
                      <Icon.ArrowRight />
                    </a>
                  )}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
