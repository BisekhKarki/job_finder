"use client";

import Loading from "@/components/loading";
import { useContextValues } from "@/context/ContextProvider";
import useLocalStorage from "@/hooks/useLocalStorage";
import { baseurl } from "@/lib/baseurl";
import { Job } from "@/types";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const JobsPostedListing = () => {
  const { accessToken } = useLocalStorage();
  const { loading, setLoading } = useContextValues();
  const [jobs, setJobs] = useState<Job[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${baseurl}/api/jobs/list/all`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const val = await response.json();

        if (response.ok) {
          setJobs(val.job || []);
          console.log(val);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchJobs();
    }
  }, [accessToken]);

  if (loading)
    return (
      <div className="mt-20">
        <Loading variant="dots" />
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Jobs You Posted
        </h1>
        <p className="text-slate-500 text-sm">
          Manage and track your job listings
        </p>
      </div>

      {/* Empty State */}
      {jobs && jobs.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-2xl">
          <p className="text-slate-500">No jobs posted yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs &&
            jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                {/* Top Row */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {job.title}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {job.location || "Remote / Not specified"}
                    </p>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      job.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {job.is_active ? "Active" : "Closed"}
                  </span>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                  <span className="bg-slate-100 px-3 py-1 rounded-lg">
                    {job.job_type.replace("_", " ")}
                  </span>
                  <span className="bg-slate-100 px-3 py-1 rounded-lg">
                    {job.experience_level}
                  </span>
                  <span className="bg-slate-100 px-3 py-1 rounded-lg">
                    NPR {job.salary_min} - {job.salary_max}
                  </span>
                </div>

                {/* Tags (NEW) */}
                {job.tags && job.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.tags &&
                      job.tags.map((tag: any) => (
                        <span
                          key={tag?.id}
                          className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100"
                        >
                          #{tag?.name}
                        </span>
                      ))}
                  </div>
                )}

                {/* Description */}
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                  {job.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Posted on {new Date(job.created_at).toLocaleDateString()}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/home/job/${job.slug}`)}
                      className="px-4 py-2 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() =>
                        router.push(`/home/job/${job.slug}/update`)
                      }
                      className="px-4 py-2 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default JobsPostedListing;
