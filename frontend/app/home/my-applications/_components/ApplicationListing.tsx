"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { baseurl } from "@/lib/baseurl";
import useLocalStorage from "@/hooks/useLocalStorage";
import Link from "next/link";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useContextValues } from "@/context/ContextProvider";

interface ApplicationItem {
  id: string;
  slug: string;
  status: string;
  applied_at: string;
  updated_at: string;
  job: {
    id: string;
    slug: string;
    title: string;
    company?: {
      name: string;
    };
    location: string;
    salary_min: number;
    salary_max: number;
  };
}

interface FilterState {
  search: string;
  status: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    ApplicationItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "",
  });
  const [refreshing, setRefreshing] = useState(false);
  const { userRole } = useContextValues();

  const router = useRouter();
  const { accessToken } = useLocalStorage();

  // Status options
  const statusOptions = [
    {
      value: "applied",
      label: "Applied",
      color: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      value: "reviewing",
      label: "Reviewing",
      color: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      value: "shortlisted",
      label: "Shortlisted",
      color: "bg-green-50",
      textColor: "text-green-700",
    },
    {
      value: "interviewing",
      label: "Interviewing",
      color: "bg-indigo-50",
      textColor: "text-indigo-700",
    },
    {
      value: "hired",
      label: "Hired",
      color: "bg-green-50",
      textColor: "text-green-700",
    },
    {
      value: "rejected",
      label: "Rejected",
      color: "bg-red-50",
      textColor: "text-red-700",
    },
    {
      value: "withdrawn",
      label: "Withdrawn",
      color: "bg-gray-50",
      textColor: "text-gray-700",
    },
  ];

  // Get status styles
  const getStatusStyles = (status: string) => {
    const statusData = {
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
        title: "Rejected",
      },
      withdrawn: {
        bg: "bg-gray-50",
        text: "text-gray-700",
        icon: <XCircleIcon className="w-5 h-5" />,
        title: "Withdrawn",
      },
    };
    return statusData[status as keyof typeof statusData] || statusData.applied;
  };

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch(`${baseurl}/api/application/my/`, {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
        });
        const data = await res.json();
        if (res.ok) {
          const apps = Array.isArray(data)
            ? data
            : data.applications || data.data || [];
          setApplications(apps);
          setFilteredApplications(apps);
        }
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchApplications();
    }
  }, [accessToken]);

  useEffect(() => {
    let result = applications;

    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (app) =>
          app.job.title.toLowerCase().includes(query) ||
          app.job.location.toLowerCase().includes(query) ||
          app.job.company?.name?.toLowerCase().includes(query),
      );
    }

    if (filters.status) {
      result = result.filter((app) => app.status === filters.status);
    }

    setFilteredApplications(result);
  }, [filters, applications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${baseurl}/api/applications/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const apps = Array.isArray(data)
          ? data
          : data.results || data.data || [];
        setApplications(apps);
        setFilteredApplications(apps);
      }
    } catch (err) {
      console.error("Failed to refresh applications:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusCounts = () => {
    return statusOptions.map((option) => ({
      ...option,
      count: applications.filter((app) => app.status === option.value).length,
    }));
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-40 bg-slate-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                📋 My Applications
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                Track your job applications and their status
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition disabled:opacity-50"
            >
              <ArrowPathIcon
                className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* STATUS OVERVIEW */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {statusCounts.map((status) => (
            <button
              key={status.value}
              onClick={() =>
                setFilters((prev) =>
                  prev.status === status.value
                    ? { ...prev, status: "" }
                    : { ...prev, status: status.value },
                )
              }
              className={`p-4 rounded-xl border-2 transition-all ${
                filters.status === status.value
                  ? `border-slate-900 ${status.color}`
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <p className="text-2xl font-bold text-slate-900 mb-1">
                {status.count}
              </p>
              <p className="text-xs text-slate-600 font-medium">
                {status.label}
              </p>
            </button>
          ))}
        </div>

        {/* FILTERS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Search Applications
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Job title, company, location..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition"
              >
                <option value="">All Statuses</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(filters.search || filters.status) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setFilters({ search: "", status: "" })}
                className="text-sm text-slate-600 hover:text-slate-900 font-medium transition"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* APPLICATIONS LIST */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 mb-4">
              Showing{" "}
              <span className="font-semibold">
                {filteredApplications.length}
              </span>{" "}
              of <span className="font-semibold">{applications.length}</span>{" "}
              applications
            </p>

            {filteredApplications.map((app, index) => {
              const statusStyle = getStatusStyles(app.status);
              return (
                <Link key={app.id} href={`/home/job/${app.job.slug}`}>
                  <div
                    className="group bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-lg transition-all duration-300 cursor-pointer animate-fadeIn"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* JOB INFO */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-700 transition mb-1">
                          {app.job.title}
                        </h3>
                        <p className="text-sm text-slate-600 mb-3">
                          {app.job.company?.name || "Company"} •{" "}
                          {app.job.location}
                        </p>

                        {/* SALARY & DATE */}
                        <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                          <span>
                            NPR {app.job.salary_min.toLocaleString()} - NPR{" "}
                            {app.job.salary_max.toLocaleString()}
                          </span>
                          <span>
                            Applied{" "}
                            {new Date(app.applied_at).toLocaleDateString()}
                          </span>
                          <span>
                            Updated{" "}
                            {new Date(app.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* STATUS BADGE */}
                      <div
                        className={`rounded-lg p-3 border shrink-0 ${statusStyle.bg}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={statusStyle.text}>
                            {statusStyle.icon}
                          </div>
                          <div>
                            <p
                              className={`text-sm font-semibold ${statusStyle.text}`}
                            >
                              {statusStyle.title}
                            </p>
                            <p className="text-xs text-slate-600 capitalize">
                              {app.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              No applications yet
            </h3>
            <p className="text-slate-600 text-center max-w-md mb-8">
              {applications.length === 0
                ? "Start applying to jobs and track your applications here!"
                : "No applications match your filters. Try adjusting your search criteria."}
            </p>
            <button
              onClick={() => router.push("/home")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all hover:shadow-lg"
            >
              Explore Jobs
            </button>
          </div>
        )}
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

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
