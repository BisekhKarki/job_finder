"use client";

import { Application, Job } from "@/types";
import { Switch } from "@headlessui/react";
import { useState, useEffect } from "react";
import { baseurl } from "@/lib/baseurl";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useParams, useRouter } from "next/navigation";
import { useContextValues } from "@/context/ContextProvider";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  SparklesIcon,
  TrashIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

type Props = {
  job: Job | null;
  application: Application | null;
  applications: Application[];
};

const statusOptions = [
  { value: "all", label: "All Applications", color: "text-slate-700" },
  { value: "applied", label: "Applied", color: "text-blue-700" },
  { value: "reviewing", label: "Reviewing", color: "text-purple-700" },
  { value: "shortlisted", label: "Shortlisted", color: "text-green-700" },
  { value: "interviewing", label: "Interviewing", color: "text-indigo-700" },
  { value: "hired", label: "Hired", color: "text-emerald-700" },
  { value: "rejected", label: "Rejected", color: "text-red-700" },
  { value: "withdrawn", label: "Withdrawn", color: "text-gray-700" },
];

const JobDetail = ({ job, application, applications }: Props) => {
  const [jobData, setJobData] = useState<Job | null>(job);
  const { accessToken } = useLocalStorage();
  const [enabled, setEnabled] = useState(job?.is_active ?? false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const router = useRouter();
  const contextValues = useContextValues();
  const userRole = contextValues?.userRole;
  const { slug } = useParams();

  // Filter applications based on selected status
  const filteredApplications =
    statusFilter === "all"
      ? applications
      : applications.filter((app) => app.status === statusFilter);

  // Get status counts
  const getStatusCount = (status: string) => {
    if (status === "all") return applications.length;
    return applications.filter((app) => app.status === status).length;
  };

  useEffect(() => {
    const fetchSaved = async () => {
      if (job === null || !accessToken) return;
      const response = await fetch(`${baseurl}/api/jobs/saved/${job?.id}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const val = await response.json();

      if (response.ok) {
        if (val.saved_job.jobs.id == job?.id) {
          setIsSaved(true);
        }
      } else {
        setIsSaved(false);
      }
    };

    if (userRole === "applicant") {
      fetchSaved();
    }
  }, [job, accessToken, userRole]);

  const toggleActive = async (value: boolean) => {
    if (!jobData) return;

    setEnabled(value);

    try {
      const res = await fetch(
        `${baseurl}/api/jobs/${jobData.slug}/toggle-status/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            is_active: value,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setJobData(data.job);
      }
    } catch (err) {
      console.log(err);
      setEnabled(!value);
    }
  };

  useEffect(() => {
    const isWithin24Hours = (dateString: string): boolean => {
      const now = new Date();
      const past = new Date(dateString);

      const diffMs = now.getTime() - past.getTime();
      const hours = diffMs / (1000 * 60 * 60);

      return hours <= 24;
    };
    if (!isWithin24Hours) {
      toggleActive(false);
    }
  }, [job?.is_active]);

  const toggleSaveJob = async () => {
    if (!jobData || !accessToken) return;

    setIsSaving(true);

    try {
      const res = await fetch(`${baseurl}/api/jobs/${jobData.slug}/save/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ jobs: job?.id }),
      });

      if (res.ok) {
        setIsSaved(!isSaved);
      } else {
        setIsSaved(false);
      }
    } catch (err) {
      console.log("Error saving job:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleWithdrawApplication = async () => {
    if (!application) return;

    setWithdrawing(true);
    try {
      const res = await fetch(
        `${baseurl}/api/jobs/${jobData?.slug}/applications/${application.slug}/withdraw/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (res.ok) {
        console.log("Application withdrawn successfully");
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to withdraw application:", err);
    } finally {
      setWithdrawing(false);
    }
  };

  // Status badge styling
  const getStatusStyles = (status: string) => {
    const styles: Record<
      string,
      {
        bg: string;
        text: string;
        icon: React.ReactNode;
        title: string;
      }
    > = {
      applied: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        icon: <ClockIcon className="w-5 h-5" />,
        title: "Application Submitted",
      },
      reviewing: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        icon: <SparklesIcon className="w-5 h-5" />,
        title: "Under Review",
      },
      shortlisted: {
        bg: "bg-green-50",
        text: "text-green-700",
        icon: <CheckCircleIcon className="w-5 h-5" />,
        title: "Shortlisted",
      },
      interviewing: {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        icon: <SparklesIcon className="w-5 h-5" />,
        title: "Interview Round",
      },
      hired: {
        bg: "bg-green-50",
        text: "text-green-700",
        icon: <CheckCircleIcon className="w-5 h-5" />,
        title: "Hired",
      },
      rejected: {
        bg: "bg-red-50",
        text: "text-red-700",
        icon: <XCircleIcon className="w-5 h-5" />,
        title: "Application Rejected",
      },
      withdrawn: {
        bg: "bg-gray-50",
        text: "text-gray-700",
        icon: <XCircleIcon className="w-5 h-5" />,
        title: "Application Withdrawn",
      },
    };
    return styles[status] || styles.applied;
  };

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      {/* BACK BUTTON */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition"
        >
          <span className="text-lg">←</span>
          Back
        </button>
      </div>

      {/* HEADER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {jobData?.title}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {jobData?.location || "Remote / Not specified"}
            </p>
          </div>

          {/* SWITCH */}
          {userRole === "employer" && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                {enabled ? "Active" : "Inactive"}
              </span>

              <Switch
                checked={enabled}
                onChange={toggleActive}
                className={`${
                  enabled ? "bg-green-500" : "bg-gray-300"
                } relative inline-flex h-6 w-11 items-center rounded-full transition`}
              >
                <span
                  className={`${
                    enabled ? "translate-x-6" : "translate-x-1"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>
            </div>
          )}
        </div>

        {/* META */}
        <div className="flex flex-wrap gap-3 mt-4 text-sm text-slate-600">
          <span className="bg-slate-100 px-3 py-1 rounded-lg">
            {jobData?.job_type?.replace("_", " ")}
          </span>
          <span className="bg-slate-100 px-3 py-1 rounded-lg">
            {jobData?.experience_level}
          </span>
          <span className="bg-slate-100 px-3 py-1 rounded-lg">
            NPR {jobData?.salary_min} - {jobData?.salary_max}
          </span>
        </div>

        {/* TAGS */}
        {jobData && jobData?.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {jobData &&
              jobData.tags.map((tag: any) => (
                <span
                  key={tag.id}
                  className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100"
                >
                  #{tag.name}
                </span>
              ))}
          </div>
        )}
      </div>

      {/* DESCRIPTION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Job Description
        </h2>
        <p className="text-sm text-slate-600 whitespace-pre-line">
          {jobData?.description}
        </p>
      </div>

      {/* REQUIREMENTS */}
      {jobData?.requirements && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Requirements
          </h2>
          <p className="text-sm text-slate-600 whitespace-pre-line">
            {jobData.requirements}
          </p>
        </div>
      )}

      {/* APPLICATIONS SECTION */}
      {userRole === "employer" && applications && applications?.length > 0 ? (
        <div className="max-w-4xl mx-auto mt-10">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span>Applications ({applications.length})</span>
              <FunnelIcon className="w-5 h-5 text-slate-600" />
            </h2>

            {/* STATUS FILTER TABS */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-200">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    statusFilter === option.value
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {option.label}
                  {getStatusCount(option.value) > 0 && (
                    <span className="ml-2 font-semibold">
                      ({getStatusCount(option.value)})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* APPLICATIONS LIST */}
          {filteredApplications.length > 0 ? (
            <div className="space-y-3">
              {filteredApplications.map((app: any, index: number) => (
                <div
                  key={app.slug || index}
                  className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 animate-fadeIn"
                >
                  {/* LEFT SIDE */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center font-semibold text-white">
                      {app.applicant?.username?.[0]?.toUpperCase() || "A"}
                    </div>

                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {app.applicant?.username}
                      </p>
                      <p className="text-xs text-slate-500">
                        {app.applicant?.email}
                      </p>
                    </div>
                  </div>

                  {/* STATUS BADGE */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap mx-3 ${
                      app.status === "applied"
                        ? "bg-blue-100 text-blue-700"
                        : app.status === "reviewing"
                          ? "bg-purple-100 text-purple-700"
                          : app.status === "shortlisted"
                            ? "bg-green-100 text-green-700"
                            : app.status === "interviewing"
                              ? "bg-indigo-100 text-indigo-700"
                              : app.status === "hired"
                                ? "bg-emerald-100 text-emerald-700"
                                : app.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {app.status}
                  </span>

                  {/* ACTION BUTTON */}
                  <button
                    onClick={() =>
                      router.push(`/home/job/${slug}/application/${app.slug}`)
                    }
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-md active:scale-95 whitespace-nowrap"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-slate-600 font-medium">
                No applications with status "
                {statusOptions
                  .find((s) => s.value === statusFilter)
                  ?.label.toLowerCase()}
                "
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          {userRole === "employer" && (
            <div className="w-full flex items-center justify-center py-16 px-4">
              <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center transition hover:shadow-md">
                {/* ICON */}
                <div className="flex justify-center mb-5">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-50">
                    <svg
                      className="w-8 h-8 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 17v-6h6v6m-7 4h8a2 2 0 002-2V7l-6-4-6 4v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>

                {/* TITLE */}
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  No Applications Yet
                </h2>

                {/* DESCRIPTION */}
                <p className="text-sm text-slate-600 mb-6">
                  No one has applied for this job yet. Once candidates submit
                  their applications, they will appear here.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* APPLICATION SECTION - SHOW FOR APPLICANTS */}
      {userRole === "applicant" && (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 mb-6">
          {!application ? (
            // No application yet - Show apply section
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  Ready to apply?
                </h3>
                <p className="text-sm text-slate-600">
                  Submit your application and let the employer know about your
                  interest.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={toggleSaveJob}
                  disabled={isSaving}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
                    isSaved
                      ? "bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200"
                      : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                  } shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="text-lg">{isSaved ? "★" : "☆"}</span>
                  {isSaving ? "Saving..." : isSaved ? "Saved" : "Save Job"}
                </button>
                <button
                  onClick={() =>
                    router.push(`/home/job/${jobData?.slug}/application`)
                  }
                  disabled={!job?.is_active}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                  {job?.is_active ? "Apply Now" : "Job has exprired"}
                </button>
              </div>
            </div>
          ) : (
            // Application exists - Show status
            <div className="space-y-4">
              {/* STATUS HEADER */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    Your Application Status
                  </h3>
                </div>
              </div>

              {/* STATUS BADGE */}
              <div
                className={`rounded-xl p-4 border ${
                  getStatusStyles(application.status).bg
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={getStatusStyles(application.status).text}>
                    {getStatusStyles(application.status).icon}
                  </div>
                  <div>
                    <p
                      className={`font-semibold ${
                        getStatusStyles(application.status).text
                      }`}
                    >
                      {getStatusStyles(application.status).title}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 capitalize">
                      Status: {application.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* STATUS MESSAGES */}
              <div className="text-sm text-slate-700 space-y-2">
                {application.status === "applied" && (
                  <p>
                    ✓ Your application is in the queue. The employer will review
                    it soon.
                  </p>
                )}
                {application.status === "reviewing" && (
                  <p>
                    ✓ Great! Your application is being reviewed by the employer.
                    Stay tuned!
                  </p>
                )}
                {application.status === "shortlisted" && (
                  <p className="text-green-700 font-semibold">
                    ✓ Congratulations! You've been shortlisted. Expect to hear
                    from them soon.
                  </p>
                )}
                {application.status === "interviewing" && (
                  <p className="text-green-700 font-semibold">
                    ✓ You're invited for an interview! Check your email for
                    details.
                  </p>
                )}
                {application.status === "hired" && (
                  <p className="text-green-700 font-semibold">
                    ✓ Congratulations! You've been hired! 🎉
                  </p>
                )}
                {application.status === "rejected" && (
                  <p className="text-slate-700">
                    Your application wasn't selected this time. Don't worry,
                    keep applying!
                  </p>
                )}
                {application.status === "withdrawn" && (
                  <p className="text-slate-700">
                    You've withdrawn your application from this position.
                  </p>
                )}
              </div>

              {!["rejected", "hired", "withdrawn"].includes(
                application.status,
              ) && (
                <div className="pt-4 border-t border-blue-200">
                  <button
                    onClick={handleWithdrawApplication}
                    disabled={withdrawing}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-300 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    {withdrawing ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                        Withdrawing...
                      </>
                    ) : (
                      <>
                        <TrashIcon className="w-5 h-5" />
                        Withdraw Application
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* SAVE JOB BUTTON */}
              <div className="pt-2">
                <button
                  onClick={toggleSaveJob}
                  disabled={isSaving}
                  className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    isSaved
                      ? "bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200"
                      : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                  } shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="text-lg">{isSaved ? "★" : "☆"}</span>
                  {isSaving ? "Saving..." : isSaved ? "Saved" : "Save Job"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ANIMATIONS */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default JobDetail;
