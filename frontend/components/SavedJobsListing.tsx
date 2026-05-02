"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { baseurl } from "@/lib/baseurl";
import useLocalStorage from "@/hooks/useLocalStorage";
import Link from "next/link";
import {
  TrashIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Pagination from "./Pagination";

interface SavedJob {
  id: string;
  jobs: {
    id: string;
    slug: string;
    title: string;
    location: string;
    job_type: string;
    experience_level: string;
    salary_min: number;
    salary_max: number;
    description: string;
    company?: {
      name: string;
    };
    tags?: Array<{ id: string; name: string }>;
  };
  saved_at: string;
}

interface FilterState {
  search: string;
  jobType: string;
  experienceLevel: string;
}

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    jobType: "",
    experienceLevel: "",
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());

  const router = useRouter();
  const { accessToken } = useLocalStorage();
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPage = Math.ceil(savedJobs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  // Fetch saved jobs
  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const res = await fetch(`${baseurl}/api/jobs/saved/all/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
        });

        if (res.ok) {
          const data = await res.json();
          setSavedJobs(data.saved_job || data || []);
          setFilteredJobs(data.saved_job || data || []);
        }
      } catch (err) {
        console.error("Failed to fetch saved jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchSavedJobs();
    }
  }, [accessToken]);

  // Apply filters
  useEffect(() => {
    let result = savedJobs;

    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.jobs.title.toLowerCase().includes(query) ||
          item.jobs.location.toLowerCase().includes(query) ||
          item.jobs.description.toLowerCase().includes(query),
      );
    }

    if (filters.jobType) {
      result = result.filter((item) => item.jobs.job_type === filters.jobType);
    }

    if (filters.experienceLevel) {
      result = result.filter(
        (item) => item.jobs.experience_level === filters.experienceLevel,
      );
    }

    setFilteredJobs(result);
  }, [filters, savedJobs]);

  const handleRemoveJob = async (jobId: string) => {
    setDeletingId(jobId);
    try {
      const job = savedJobs.find((j) => j.id === jobId)?.jobs;
      if (!job) return;

      const res = await fetch(`${baseurl}/api/jobs/${job.slug}/save/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.ok) {
        setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
        setSelectedJobs((prev) => {
          const updated = new Set(prev);
          updated.delete(jobId);
          return updated;
        });
      }
    } catch (err) {
      console.error("Failed to remove job:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobs((prev) => {
      const updated = new Set(prev);
      if (updated.has(jobId)) {
        updated.delete(jobId);
      } else {
        updated.add(jobId);
      }
      return updated;
    });
  };

  const jobTypes = [...new Set(savedJobs.map((j) => j.jobs.job_type))];
  const experienceLevels = [
    ...new Set(savedJobs.map((j) => j.jobs.experience_level)),
  ];
  const paginatedJobs = filteredJobs.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-slate-200 rounded-xl animate-pulse"
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                ★ Saved Jobs
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                {savedJobs && savedJobs.length} opportunity
                {savedJobs && savedJobs.length !== 1 ? "ies" : ""} saved for you
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* FILTERS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Job title, location..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition"
                />
              </div>
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Job Type
              </label>
              <select
                value={filters.jobType}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, jobType: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition"
              >
                <option value="">All Types</option>
                {jobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Experience Level
              </label>
              <select
                value={filters.experienceLevel}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    experienceLevel: e.target.value,
                  }))
                }
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition"
              >
                <option value="">All Levels</option>
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                onClick={() =>
                  setFilters({
                    search: "",
                    jobType: "",
                    experienceLevel: "",
                  })
                }
                className="w-full px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        {paginatedJobs && paginatedJobs.length > 0 ? (
          <>
            {/* BULK ACTIONS */}
            {selectedJobs.size > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <p className="text-blue-700 text-sm font-medium">
                  {selectedJobs.size} job{selectedJobs.size !== 1 ? "s" : ""}{" "}
                  selected
                </p>
                <button
                  onClick={() => setSelectedJobs(new Set())}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition"
                >
                  Clear Selection
                </button>
              </div>
            )}

            {/* JOBS LIST */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {paginatedJobs &&
                paginatedJobs.map((item, index) => (
                  <div
                    key={item.id}
                    className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all duration-300 animate-fadeIn"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* CHECKBOX */}
                    <div className="absolute top-4 left-4 z-10">
                      <button
                        onClick={() => toggleJobSelection(item.id)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition ${
                          selectedJobs.has(item.id)
                            ? "bg-blue-600 border-blue-600"
                            : "border-slate-300 hover:border-slate-400"
                        }`}
                      >
                        {selectedJobs.has(item.id) && (
                          <CheckIcon className="w-4 h-4 text-white" />
                        )}
                      </button>
                    </div>

                    {/* REMOVE BUTTON */}
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={() => handleRemoveJob(item.id)}
                        disabled={deletingId === item.id}
                        className="p-2 rounded-lg bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-200 transition opacity-0 group-hover:opacity-100"
                      >
                        {deletingId === item.id ? (
                          <XMarkIcon className="w-5 h-5 animate-spin" />
                        ) : (
                          <TrashIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* CONTENT */}
                    <Link href={`/home/job/${item.jobs.slug}`}>
                      <div className="p-6 cursor-pointer">
                        <div className="pt-8">
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-700 transition line-clamp-2 mb-1">
                            {item.jobs.title}
                          </h3>
                          <p className="text-sm text-slate-500 mb-4">
                            {item.jobs.location || "Remote"}
                          </p>

                          <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                            {item.jobs.description}
                          </p>

                          {/* META BADGES */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                              {item.jobs.job_type.replace("_", " ")}
                            </span>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                              {item.jobs.experience_level}
                            </span>
                          </div>

                          {/* SALARY */}
                          <div className="pt-4 border-t border-slate-200">
                            <p className="text-sm font-semibold text-slate-900">
                              NPR {item.jobs.salary_min.toLocaleString()} - NPR{" "}
                              {item.jobs.salary_max.toLocaleString()}
                            </p>
                          </div>

                          {/* SAVED DATE */}
                          <p className="text-xs text-slate-500 mt-3">
                            Saved {new Date(item.saved_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>

                    {/* TAGS */}
                    {item.jobs.tags && item.jobs.tags.length > 0 && (
                      <div className="px-6 pb-6 pt-0">
                        <div className="flex flex-wrap gap-1">
                          {item.jobs.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag.id}
                              className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100"
                            >
                              #{tag.name}
                            </span>
                          ))}
                          {item.jobs.tags.length > 3 && (
                            <span className="text-xs text-slate-500">
                              +{item.jobs.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
            <Pagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalPage={totalPage}
            />

            {/* RESULTS INFO */}
            <div className="mt-8 text-center">
              <p className="text-slate-600 text-sm">
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {paginatedJobs.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900">
                  {paginatedJobs.length}
                </span>{" "}
                saved jobs
              </p>
            </div>
          </>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">★</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              No saved jobs yet
            </h3>
            <p className="text-slate-600 text-center max-w-md mb-8">
              {savedJobs.length === 0
                ? "Start exploring job opportunities and save the ones you're interested in!"
                : "No jobs match your filters. Try adjusting your search criteria."}
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
