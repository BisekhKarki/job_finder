"use client";

import {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  FormEvent,
  DragEvent,
  ReactNode,
  MouseEvent,
} from "react";
import Link from "next/link";
import { baseurl } from "@/lib/baseurl";
import useLocalStorage from "@/hooks/useLocalStorage";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { CompanyProps } from "@/app/home/company/_components/RenderCompanyProfile";

type FormDataType = {
  company_name: string;
  website: string;
  description: string;
  location: string;
};

type ErrorsType = {
  company_name?: string;
  website?: string;
  location?: string;
  logo?: string;
};

const COMPANY_NAME_MAX = 50;
const LOCATION_MAX = 200;
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/gif,image/webp";

const inputClass = (hasError: boolean) =>
  `w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 ${
    hasError
      ? "border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
      : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:bg-white"
  }`;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {msg}
    </p>
  );
}

function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={htmlFor} className="text-sm font-medium text-slate-800">
          {label}
          {required && <span className="text-blue-600 ml-1">*</span>}
        </label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
      <FieldError msg={error} />
    </div>
  );
}

interface UpdateCompanyProfileProps {
  slug: string;
  initialData?: CompanyProps | (null & { logo?: string });
}

export default function UpdateCompanyProfile({
  slug,
  initialData,
}: UpdateCompanyProfileProps) {
  const [formData, setFormData] = useState<FormDataType>({
    company_name: "",
    website: "",
    description: "",
    location: "",
  });
  const { accessToken } = useLocalStorage();
  const router = useRouter();

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<ErrorsType>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadCompanyData = async () => {
      if (initialData) {
        setFormData({
          company_name: initialData.company_name || "",
          website: initialData.website || "",
          description: initialData.description || "",
          location: initialData.location || "",
        });
        if (initialData.logo) {
          setLogoPreview(`${baseurl}${initialData.logo}`);
        }
        return;
      }
    };

    loadCompanyData();
  }, [slug, initialData, accessToken]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
    if (errors[name as keyof ErrorsType]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLogoChange = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
      setErrors((prev) => ({
        ...prev,
        logo: "Please upload a PNG, JPG, GIF, or WebP image.",
      }));
      return;
    }

    if (file.size > MAX_LOGO_BYTES) {
      setErrors((prev) => ({
        ...prev,
        logo: "Image must be under 2MB.",
      }));
      return;
    }

    setLogoFile(file);
    setHasChanges(true);
    setErrors((prev) => ({ ...prev, logo: "" }));

    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeLogo = (e: MouseEvent) => {
    e.stopPropagation();
    setLogoFile(null);
    setLogoPreview(null);
    setHasChanges(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleLogoChange(e.dataTransfer.files[0]);
  };

  const validate = (): ErrorsType => {
    const newErrors: ErrorsType = {};

    const name = formData.company_name.trim();
    if (!name) {
      newErrors.company_name = "Company name is required.";
    } else if (name.length > COMPANY_NAME_MAX) {
      newErrors.company_name = `Company name must be ${COMPANY_NAME_MAX} characters or fewer.`;
    }

    if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
      newErrors.website = "Enter a valid URL (e.g. https://example.com)";
    }

    const location = formData.location.trim();
    if (!location) {
      newErrors.location = "Location is required.";
    } else if (location.length > LOCATION_MAX) {
      newErrors.location = `Location must be ${LOCATION_MAX} characters or fewer.`;
    }

    return newErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!accessToken) {
      toast.error("Authentication required", { position: "bottom-right" });
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("company_name", formData.company_name);
      formDataToSend.append("website", formData.website);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("location", formData.location);

      if (logoFile) {
        formDataToSend.append("logo", logoFile);
      }

      const response = await fetch(
        `${baseurl}/api/jobs/company/${slug}/update/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formDataToSend,
        },
      );

      const val = await response.json();

      if (response.ok) {
        toast.success("Company profile updated successfully", {
          position: "bottom-right",
        });
        setHasChanges(false);
        router.push("/home/company");
      } else {
        toast.error(val.errors?.message || "Failed to update company profile", {
          position: "bottom-right",
        });
      }
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error("Error updating company profile", {
        position: "bottom-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 relative overflow-x-hidden flex items-center justify-center">
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(15,23,42,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />
        <div className="relative z-10">
          <svg
            className="animate-spin"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeWidth="3"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    );
  }

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

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-10 pb-24">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-10"
        >
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
          Back
        </Link>

        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600 mb-3">
            Edit Company
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">
            Update company profile
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Edit your company details. Changes will be saved to your profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm shadow-slate-200/40">
            <div className="mb-4">
              <p className="text-sm font-medium text-slate-800 mb-1">
                Company logo
                <span className="text-xs text-slate-400 font-normal ml-2">
                  Optional
                </span>
              </p>
              <p className="text-xs text-slate-500">
                PNG, JPG, GIF, or WebP. Max 2MB. Square images work best.
              </p>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className={`group relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
                dragActive
                  ? "border-blue-400 bg-blue-50/70"
                  : errors.logo
                    ? "border-red-300 bg-red-50/40"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
              }`}
            >
              {logoPreview ? (
                <div className="flex items-center gap-5 p-5">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shrink-0 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {logoFile?.name ?? "Logo uploaded"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {logoFile && `${(logoFile.size / 1024).toFixed(1)} KB`}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Replace
                      </button>
                      <span className="text-slate-300">·</span>
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3 transition-colors group-hover:bg-white group-hover:border-slate-300">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-slate-500"
                      aria-hidden="true"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-700">
                    <span className="font-medium text-blue-600">
                      Click to upload
                    </span>
                    <span className="text-slate-500"> or drag and drop</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PNG, JPG, GIF, WebP (max 2MB)
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                hidden
                onChange={(e) => handleLogoChange(e.target.files?.[0])}
              />
            </div>
            <FieldError msg={errors.logo} />
          </div>

          {/* Details card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-5 shadow-sm shadow-slate-200/40">
            <Field
              label="Company name"
              htmlFor="company_name"
              required
              hint={`${formData.company_name.length} / ${COMPANY_NAME_MAX}`}
              error={errors.company_name}
            >
              <input
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Acme Inc."
                maxLength={COMPANY_NAME_MAX}
                className={inputClass(!!errors.company_name)}
              />
            </Field>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field
                label="Website"
                htmlFor="website"
                hint="Optional"
                error={errors.website}
              >
                <input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className={inputClass(!!errors.website)}
                />
              </Field>

              <Field
                label="Location"
                htmlFor="location"
                required
                error={errors.location}
              >
                <input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="San Francisco, CA"
                  maxLength={LOCATION_MAX}
                  className={inputClass(!!errors.location)}
                />
              </Field>
            </div>

            <Field label="Description" htmlFor="description" hint="Optional">
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell people what your company does..."
                rows={5}
                className={`${inputClass(false)} resize-none leading-relaxed`}
              />
            </Field>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-1">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !hasChanges}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeOpacity="0.25"
                      strokeWidth="3"
                    />
                    <path
                      d="M12 2a10 10 0 0 1 10 10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  Save changes
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
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
