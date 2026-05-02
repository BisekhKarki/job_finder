"use client";

import useLocalStorage from "@/hooks/useLocalStorage";
import { baseurl } from "@/lib/baseurl";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface TagInterface {
  id: number;
  name: string;
  slug: string;
}

interface JobFormData {
  title: string;
  description: string;
  requirements: string;
  jobType: "full_time" | "part_time" | "contract" | "remote" | "internship";
  experienceLevel: "entry" | "mid" | "senior";
  location: string;
  salaryMin: string;
  salaryMax: string;
  tags: TagInterface[];
  expiresAt: string;
}

const PostJobPage = () => {
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    requirements: "",
    jobType: "full_time",
    experienceLevel: "entry",
    location: "",
    salaryMin: "",
    salaryMax: "",
    tags: [],
    expiresAt: "",
  });

  const [currentTag, setCurrentTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { accessToken } = useLocalStorage();
  const router = useRouter();

  const jobTypes = [
    { value: "full_time", label: "Full Time" },
    { value: "part_time", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "remote", label: "Remote" },
    { value: "internship", label: "Internship" },
  ];

  const experienceLevels = [
    { value: "entry", label: "Entry Level" },
    { value: "mid", label: "Mid Level" },
    { value: "senior", label: "Senior Level" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleAddTag = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || !currentTag.trim()) return;
    e.preventDefault();
    const tagName = currentTag.trim().toLowerCase();
    const alreadyExistsInState = formData.tags.some(
      (t) => t?.name.toLowerCase() === tagName,
    );

    if (alreadyExistsInState) {
      toast.error("Tag already added");
      return;
    }

    try {
      const res = await fetch(`${baseurl}/api/jobs/tags/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      const existingTag: TagInterface | undefined = data.tags.find(
        (t: TagInterface) => t.name.toLowerCase() === tagName,
      );

      let tagToAdd: TagInterface;

      if (existingTag) {
        tagToAdd = existingTag;
      } else {
        const createRes = await fetch(`${baseurl}/api/jobs/tags/add/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ name: currentTag }),
        });

        const created = await createRes.json();

        if (!createRes.ok) {
          toast.error(created?.error || "Failed to create tag");
          return;
        }
        console.log(created);

        tagToAdd = created.tags;
      }

      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagToAdd],
      }));

      setCurrentTag("");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag.slug !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Job title is required";
    if (!formData.description.trim())
      newErrors.description = "Job description is required";
    if (!formData.requirements.trim())
      newErrors.requirements = "Job requirements are required";
    if (!formData.location.trim()) newErrors.location = "Location is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsSubmitting(true);
    let valuesForm = {
      title: formData.title,
      description: formData.description,
      requirements: formData.requirements,
      job_type: formData.jobType,
      experience_level: formData.experienceLevel,
      salary_min: formData.salaryMin ? Number(formData.salaryMin) : null,
      salary_max: formData.salaryMax ? Number(formData.salaryMax) : null,
      expires_at: formData.expiresAt || null,
      tags: formData.tags.map((tag) => tag.id),
      location: formData.location,
    };
    try {
      console.log("Form Data:", formData);
      const response = await fetch(`${baseurl}/api/jobs/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(valuesForm),
      });
      const val = await response.json();
      if (response.ok) {
        setIsSubmitting(false);
        toast.success("Job posted successfully!");
        router.push("/home/job/posted");
      } else {
        toast.error(val.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Post a Job</h1>
          <p className="text-gray-600">
            Fill in the details below to post a new job opening
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Senior React Developer"
                className={`w-full px-4 py-3 rounded-lg border outline-none transition-all duration-300 ${
                  errors.title
                    ? "border-red-500 focus:ring-2 focus:ring-red-500/10"
                    : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Job Type and Experience Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Job Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all duration-300"
                >
                  {jobTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Experience Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all duration-300"
                >
                  {experienceLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., San Francisco, CA or Remote"
                className={`w-full px-4 py-3 rounded-lg border outline-none transition-all duration-300 ${
                  errors.location
                    ? "border-red-500 focus:ring-2 focus:ring-red-500/10"
                    : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                }`}
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location}</p>
              )}
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Salary Min */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Salary (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleInputChange}
                    placeholder="50000"
                    className="w-full pl-7 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all duration-300"
                  />
                </div>
              </div>

              {/* Salary Max */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Salary (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleInputChange}
                    placeholder="120000"
                    className="w-full pl-7 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the job, responsibilities, and what makes this position unique..."
                rows={6}
                className={`w-full px-4 py-3 rounded-lg border outline-none transition-all duration-300 resize-none ${
                  errors.description
                    ? "border-red-500 focus:ring-2 focus:ring-red-500/10"
                    : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                }`}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length} characters
              </p>
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Requirements <span className="text-red-500">*</span>
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                placeholder="List required skills, qualifications, and experience..."
                rows={6}
                className={`w-full px-4 py-3 rounded-lg border outline-none transition-all duration-300 resize-none ${
                  errors.requirements
                    ? "border-red-500 focus:ring-2 focus:ring-red-500/10"
                    : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                }`}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.requirements.length} characters
              </p>
              {errors.requirements && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.requirements}
                </p>
              )}
            </div>

            {/* Tags/Skills */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags/Skills (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type a skill and press Enter (e.g., React, TypeScript)"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all duration-300"
                />
              </div>

              {/* Tags Display */}
              {formData.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag.slug)}
                        className="text-blue-700 hover:text-blue-900 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expiration Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Expiration Date (Optional)
              </label>
              <input
                type="date"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all duration-300"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if job posting doesn't expire
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Be specific about requirements and
                responsibilities to attract qualified candidates. Use clear
                language and organize information logically.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Publishing...
                  </>
                ) : (
                  <>📢 Publish Job</>
                )}
              </button>
              <button
                type="button"
                className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors duration-300"
              >
                Save as Draft
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section (Optional) */}
        {formData.title && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Preview</h2>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {formData.title}
                </h3>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {jobTypes.find((t) => t.value === formData.jobType)?.label}
                  </span>
                  <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    {
                      experienceLevels.find(
                        (l) => l.value === formData.experienceLevel,
                      )?.label
                    }
                  </span>
                  {formData.location && (
                    <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                      📍 {formData.location}
                    </span>
                  )}
                </div>
              </div>

              {(formData.salaryMin || formData.salaryMax) && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Salary Range:</strong> ${formData.salaryMin || "—"}{" "}
                    - ${formData.salaryMax || "—"}
                  </p>
                </div>
              )}

              {formData.tags.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Required Skills:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Description:
                </p>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {formData.description}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Requirements:
                </p>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {formData.requirements}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostJobPage;
