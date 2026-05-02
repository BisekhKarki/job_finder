"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { baseurl } from "@/lib/baseurl";
import useLocalStorage from "@/hooks/useLocalStorage";
import Link from "next/link";
import {
  ArrowLeftIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Loading from "@/components/loading";

interface ApplicationFormProps {
  jobSlug?: string;
  jobTitle?: string;
}

export default function JobApplicationForm({
  jobSlug,
  jobTitle,
}: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    resume: null as File | null,
    coverLetter: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const { accessToken } = useLocalStorage();

  const slug = jobSlug || (params?.slug as string);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!validTypes.includes(file.type)) {
        setError("Please upload a PDF or Word document");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        resume: file,
      }));
      setFileName(file.name);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({
      ...prev,
      resume: null,
    }));
    setFileName(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.resume) {
        setError("Please upload your resume");
        setLoading(false);
        return;
      }

      if (!slug) {
        setError("Job information is missing");
        setLoading(false);
        return;
      }

      const formDataToSubmit = new FormData();
      formDataToSubmit.append("resume", formData.resume);
      formDataToSubmit.append("cover_letter", formData.coverLetter || "");

      const res = await fetch(`${baseurl}/api/application/${slug}/apply/`, {
        method: "POST",
        headers: {
          //   "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
        body: formDataToSubmit,
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({
          resume: null,
          coverLetter: "",
        });
        setFileName(null);

        setTimeout(() => {
          router.push(`/home`);
        }, 2000);
      } else {
        const data = await res.json();
        setError(
          data.message ||
            data.detail ||
            "Failed to submit application. Please try again.",
        );
      }
    } catch (err) {
      console.error("Application error:", err);
      setError("An error occurred while submitting your application");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center animate-fadeIn">
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400/20 rounded-full blur-lg"></div>
              <CheckCircleIcon className="w-16 h-16 text-green-500 relative" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Application Submitted!
          </h2>
          <p className="text-slate-600 mb-6">
            Your application has been successfully submitted. Good luck! 🎉
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700">
              The employer will review your application and contact you soon.
            </p>
          </div>

          <button
            onClick={() => router.push(`/jobs/${slug}`)}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Back to Job
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-4 transition"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-slate-900">
            Apply for Position
          </h1>
          <p className="text-slate-600 mt-1">{jobTitle || "Job Opening"}</p>
        </div>
      </header>

      {/* FORM */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
              <ExclamationCircleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-900">
                  Application Error
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* RESUME UPLOAD */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="mb-6">
              <label className="block text-lg font-semibold text-slate-900 mb-2">
                Upload Resume *
              </label>
              <p className="text-sm text-slate-600">
                PDF or Word document (Max 5MB)
              </p>
            </div>

            {!formData.resume ? (
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition group"
                >
                  <DocumentArrowUpIcon className="w-12 h-12 text-slate-400 group-hover:text-blue-500 mb-3 transition" />
                  <span className="text-sm font-semibold text-slate-900">
                    Drag and drop your resume here
                  </span>
                  <span className="text-xs text-slate-600 mt-1">
                    or click to browse
                  </span>
                </label>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-900">
                      {fileName}
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      {(formData.resume!.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-2 hover:bg-red-100 rounded-lg transition text-slate-400 hover:text-red-500"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* COVER LETTER */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="mb-4">
              <label
                htmlFor="cover-letter"
                className="block text-lg font-semibold text-slate-900 mb-2"
              >
                Cover Letter
              </label>
              <p className="text-sm text-slate-600">
                Tell the employer why you're a great fit for this role
                (optional)
              </p>
            </div>

            <textarea
              id="cover-letter"
              value={formData.coverLetter}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  coverLetter: e.target.value,
                }))
              }
              placeholder="Write your cover letter here... Keep it concise and highlight your relevant skills and experience."
              rows={8}
              maxLength={2000}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300 transition resize-none"
            />

            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Character count: {formData.coverLetter.length} / 2000
              </p>
              {formData.coverLetter.length > 1800 && (
                <p className="text-xs text-amber-600">Approaching limit</p>
              )}
            </div>
          </div>

          {/* INFO BOX */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">
              What happens next?
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">→</span>
                Your application will be reviewed by the employer
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">→</span>
                You'll receive email notifications about your application status
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">→</span>
                You can view your application details anytime
              </li>
            </ul>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.resume}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                loading || !formData.resume
                  ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                  Submitting...
                </span>
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
        </form>
      </div>

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
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
