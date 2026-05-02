"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { baseurl } from "@/lib/baseurl";
import useLocalStorage from "@/hooks/useLocalStorage";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import Pagination from "./Pagination";

interface Job {
  id: string;
  slug: string;
  title: string;
  location: string;
  job_type: string;
  experience_level: string;
  salary_min: number;
  salary_max: number;
  description: string;
  is_active: boolean;
  tags?: Array<{ id: string; name: string }>;
}

interface Filters {
  search: string;
  job_type: string;
  experience_level: string;
  salary_range: [number, number];
}

export const ITEMS_PER_PAGE = 10;

export default function JobHomepage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    job_type: "",
    experience_level: "",
    salary_range: [0, 500000],
  });

  //   const router = useRouter();
  const { accessToken } = useLocalStorage();

  const [currentPage, setCurrentPage] = useState(1);
  const totalPage = Math.ceil(jobs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${baseurl}/api/jobs/all/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs);
          setFilteredJobs(data.jobs);
        }
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [accessToken]);

  // Apply filters
  useEffect(() => {
    let result = jobs;

    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.location.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query),
      );
    }

    if (filters.job_type) {
      result = result.filter((job) => job.job_type === filters.job_type);
    }

    if (filters.experience_level) {
      result = result.filter(
        (job) => job.experience_level === filters.experience_level,
      );
    }

    result = result.filter(
      (job) =>
        job.salary_min >= filters.salary_range[0] &&
        job.salary_max <= filters.salary_range[1],
    );

    setFilteredJobs(result);
  }, [filters, jobs]);

  const handleFilterChange = (
    key: keyof Filters,
    value: string | [number, number],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      job_type: "",
      experience_level: "",
      salary_range: [0, 500000],
    });
  };

  const jobTypes = [...new Set(jobs.map((job) => job.job_type))];
  const experienceLevels = [
    ...new Set(jobs.map((job) => job.experience_level)),
  ];

  const paginated_items = filteredJobs.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Job Opportunities
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                Discover your next career move
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* SIDEBAR - FILTERS */}
          <aside
            className={`lg:block ${
              showFilters ? "block" : "hidden"
            } lg:col-span-1`}
          >
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">Filters</h2>
                {Object.values(filters).some(
                  (v) =>
                    v !== "" &&
                    v !== "0" &&
                    JSON.stringify(v) !== JSON.stringify([0, 500000]),
                ) && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-slate-500 hover:text-slate-700 underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* SEARCH */}
              <div className="mb-6">
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
                      handleFilterChange("search", e.target.value)
                    }
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                  />
                </div>
              </div>

              {/* JOB TYPE */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Job Type
                </label>
                <select
                  value={filters.job_type}
                  onChange={(e) =>
                    handleFilterChange("job_type", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                >
                  <option value="">All Types</option>
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* EXPERIENCE LEVEL */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Experience Level
                </label>
                <select
                  value={filters.experience_level}
                  onChange={(e) =>
                    handleFilterChange("experience_level", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                >
                  <option value="">All Levels</option>
                  {experienceLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              {/* SALARY RANGE */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-3">
                  Salary Range
                </label>
                <div className="space-y-3">
                  <div>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.salary_range[0]}
                      onChange={(e) =>
                        handleFilterChange("salary_range", [
                          parseInt(e.target.value) || 0,
                          filters.salary_range[1],
                        ])
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.salary_range[1]}
                      onChange={(e) =>
                        handleFilterChange("salary_range", [
                          filters.salary_range[0],
                          parseInt(e.target.value) || 500000,
                        ])
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    NPR {filters.salary_range[0].toLocaleString()} - NPR{" "}
                    {filters.salary_range[1].toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 bg-slate-200 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-slate-600">
                    Showing{" "}
                    <span className="font-semibold">{filteredJobs.length}</span>{" "}
                    of <span className="font-semibold">{jobs.length}</span> jobs
                  </p>
                </div>

                <div className="space-y-4">
                  {paginated_items.map((job) => (
                    <Link key={job.id} href={`/home/job/${job.slug}`}>
                      <div className="group  bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300 cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700 transition">
                              {job.title}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                              {job.location || "Remote"}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap shadow-sm transition-all
                            ${
                              job.is_active
                                ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                                : "bg-red-50 text-red-600 ring-1 ring-red-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                job.is_active ? "bg-green-500" : "bg-red-500"
                              }`}
                            />
                            {job.is_active ? "Active" : "Closed"}
                          </span>
                        </div>

                        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">
                            {job.experience_level}
                          </span>
                          <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700 font-medium">
                            NPR {job.salary_min.toLocaleString()} - NPR{" "}
                            {job.salary_max.toLocaleString()}
                          </span>
                        </div>

                        {job.tags && job.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {job.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag.id}
                                className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100"
                              >
                                #{tag.name}
                              </span>
                            ))}
                            {job.tags.length > 3 && (
                              <span className="text-xs text-slate-500">
                                +{job.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No jobs found
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  Try adjusting your filters to find more opportunities
                </p>
                <button
                  onClick={resetFilters}
                  className="inline-block px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition text-sm font-medium"
                >
                  Reset Filters
                </button>
              </div>
            )}
            <Pagination
              currentPage={currentPage}
              totalPage={totalPage}
              onPageChange={setCurrentPage}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
