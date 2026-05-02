"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { baseurl } from "@/lib/baseurl";
import useLocalStorage from "@/hooks/useLocalStorage";
import {
  ArrowLeftIcon,
  DocumentArrowUpIcon,
  ClockIcon,
  EnvelopeIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  CheckIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

interface Applicant {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  profile_picture?: string;
}

interface Job {
  id: number;
  slug: string;
  title: string;
  location: string;
  job_type: string;
  salary_min: number;
  salary_max: number;
}

interface ApplicationData {
  id: string;
  slug: string;
  applicant: Applicant;
  job: Job;
  resume: string;
  cover_letter: string;
  status: string;
  applied_at: string;
  updated_at: string;
}

const statusOptions = [
  {
    value: "applied",
    label: "Applied",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    icon: "📝",
  },
  {
    value: "reviewing",
    label: "Reviewing",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    icon: "👀",
  },
  {
    value: "shortlisted",
    label: "Shortlisted",
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    icon: "⭐",
  },
  {
    value: "interviewing",
    label: "Interviewing",
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-200",
    icon: "🎤",
  },
  {
    value: "hired",
    label: "Hired",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    icon: "🎉",
  },
  {
    value: "rejected",
    label: "Rejected",
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    icon: "❌",
  },
  {
    value: "withdrawn",
    label: "Withdrawn",
    color: "from-gray-500 to-gray-600",
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
    icon: "🚫",
  },
];

const getStatusStyles = (status: string) => {
  return statusOptions.find((s) => s.value === status) || statusOptions[0];
};

export default function ApplicationViewPage() {
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const router = useRouter();
  const params = useParams();
  const { accessToken } = useLocalStorage();
  const applicationSlug = params?.application_slug as string;
  const slug = params?.slug as string;

  // Fetch application details
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await fetch(
          `${baseurl}/api/application/single/view/${applicationSlug}/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (res.ok) {
          const data = await res.json();
          setApplication(data.applications);
          setSelectedStatus(data.applications.status);
        } else {
          console.error("Failed to fetch application");
        }
      } catch (err) {
        console.error("Error fetching application:", err);
      } finally {
        setLoading(false);
      }
    };

    if (applicationSlug && accessToken) {
      fetchApplication();
    }
  }, [applicationSlug, accessToken]);

  const handleStatusUpdate = async () => {
    if (application?.status === "rejected") {
      setUpdating(false);
      return;
    }
    if (!application || selectedStatus === application.status) return;

    setUpdating(true);
    try {
      const res = await fetch(
        `${baseurl}/api/application/${slug}/jobs/status/${applicationSlug}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ status: selectedStatus }),
        },
      );

      if (res.ok) {
        const updatedData = await res.json();
        setApplication(updatedData.application);
        console.log("Application status updated successfully");
      }
    } catch (err) {
      console.error("Failed to update application status:", err);
      setSelectedStatus(application.status);
    } finally {
      setUpdating(false);
    }
  };

  const openResume = () => {
    if (application?.resume) {
      window.open(`${baseurl}${application.resume}`, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-slate-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Application Not Found
          </h2>
          <p className="text-slate-600 mb-8">
            This application could not be found.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusStyles(application.status);
  const selectedStatusStyle = getStatusStyles(selectedStatus);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Applications
          </button>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {application.applicant.first_name}{" "}
                {application.applicant.last_name}
              </h1>
              <p className="text-slate-600 mt-1">
                Applied for{" "}
                <span className="font-semibold text-blue-600">
                  {application.job.title}
                </span>
              </p>
            </div>
            <div
              className={`bg-linear-to-br ${selectedStatusStyle.color} px-6 py-3 rounded-xl text-white shadow-lg`}
            >
              <p className="text-sm font-semibold">
                {selectedStatusStyle.icon} {selectedStatusStyle.label}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-6">
            {/* APPLICANT CARD */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-6 pb-6 border-b border-slate-200">
                <div className="relative">
                  {application.applicant.profile_picture ? (
                    <img
                      src={application.applicant.profile_picture}
                      alt={application.applicant.first_name}
                      className="w-28 h-28 rounded-2xl object-cover ring-4 ring-blue-500/20"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center ring-4 ring-blue-500/20">
                      <UserCircleIcon className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-slate-900 mb-1">
                    {application.applicant.first_name}{" "}
                    {application.applicant.last_name}
                  </h2>
                  <p className="text-blue-600 font-medium mb-4">
                    @{application.applicant.username}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-slate-700">
                      <EnvelopeIcon className="w-5 h-5 text-blue-500" />
                      <a
                        href={`mailto:${application.applicant.email}`}
                        className="hover:text-slate-900 transition-colors text-sm"
                      >
                        {application.applicant.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* TIMELINE */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <CalendarIcon className="w-5 h-5 text-blue-500 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-600">Applied on</p>
                    <p className="text-slate-900 font-semibold">
                      {new Date(application.applied_at).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <ClockIcon className="w-5 h-5 text-blue-500 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-600">Last updated</p>
                    <p className="text-slate-900 font-semibold">
                      {new Date(application.updated_at).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* JOB DETAILS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BriefcaseIcon className="w-6 h-6 text-blue-500" />
                Job Details
              </h3>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Position</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {application.job.title}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-600 mb-1 flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4" />
                      Location
                    </p>
                    <p className="text-slate-900 font-semibold">
                      {application.job.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Job Type</p>
                    <p className="text-slate-900 font-semibold">
                      {application.job.job_type.replace("_", " ")}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200">
                  <p className="text-sm text-slate-600 mb-2">Salary Range</p>
                  <p className="text-2xl font-bold text-blue-600">
                    NPR {application.job.salary_min.toLocaleString()} - NPR{" "}
                    {application.job.salary_max.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* COVER LETTER */}
            {application.cover_letter && (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">
                  📝 Cover Letter
                </h3>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
                    {application.cover_letter}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {/* RESUME BUTTON */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Resume</h3>

              <button
                onClick={openResume}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
              >
                <DocumentArrowUpIcon className="w-5 h-5" />
                View Resume
              </button>

              <p className="text-xs text-slate-600 text-center mt-3">
                Opens in a new tab
              </p>
            </div>

            {/* STATUS SELECTOR */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Update Status
              </h3>

              <div className="space-y-2 mb-6">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedStatus(option.value)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                      selectedStatus === option.value
                        ? `bg-linear-to-r ${option.color} text-white shadow-lg scale-105`
                        : `border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900`
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{option.icon}</span>
                      <span className="font-semibold text-sm">
                        {option.label}
                      </span>
                      {selectedStatus === option.value && (
                        <CheckIcon className="w-5 h-5 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleStatusUpdate}
                disabled={updating || selectedStatus === application.status}
                className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  updating || selectedStatus === application.status
                    ? "bg-slate-200 text-slate-600 cursor-not-allowed"
                    : "bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-green-500/20 active:scale-95"
                }`}
              >
                {updating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    Updating...
                  </span>
                ) : selectedStatus === application.status ? (
                  "No Changes"
                ) : (
                  "Confirm Update"
                )}
              </button>

              {selectedStatus !== application.status && (
                <button
                  onClick={() => setSelectedStatus(application.status)}
                  className="w-full mt-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* CURRENT STATUS */}
            <div
              className={`bg-linear-to-br ${statusStyle.color} rounded-2xl p-8 shadow-lg text-white`}
            >
              <p className="text-sm font-semibold opacity-90 mb-2">
                CURRENT STATUS
              </p>
              <p className="text-3xl font-bold flex items-center gap-2">
                <span>{statusStyle.icon}</span>
                {statusStyle.label}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ANIMATIONS */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .min-h-screen > * {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
