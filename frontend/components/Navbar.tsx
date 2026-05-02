"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useContextValues } from "@/context/ContextProvider";
import useLocalStorage from "@/hooks/useLocalStorage";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userRole, setUserRole] = useState("");
  const router = useRouter();
  const { isAuthenticated } = useContextValues();
  const { accessToken, removeToken } = useLocalStorage();

  const closeMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseOutsideClick = (e: MouseEvent) => {
      if (
        closeMenuRef.current &&
        !closeMenuRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseOutsideClick);
    return () =>
      document.removeEventListener("mousedown", handleMouseOutsideClick);
  }, []);

  useEffect(() => {
    const decodeToken = () => {
      if (accessToken) {
        const decode: any = jwtDecode(accessToken);
        setUserRole(decode?.role as string);
      }
    };

    decodeToken();
  }, [accessToken]);

  const roleValue = userRole?.trim()?.toLowerCase() || "";
  const isEmployer = isAuthenticated && roleValue === "employer";
  const isApplicant = isAuthenticated && roleValue === "applicant";

  const handleLogout = () => {
    setProfileOpen(false);
    removeToken();
    router.push("/login");
  };

  const navLink = (href: string, label: string, icon?: string) => (
    <Link
      href={href}
      className={`relative text-sm font-semibold px-1 py-2 transition-colors duration-300 flex items-center gap-1 ${
        pathname === href
          ? "text-blue-600"
          : "text-gray-700 hover:text-blue-600"
      } after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 ${
        pathname === href ? "after:w-full" : "after:w-0 hover:after:w-full"
      }`}
    >
      {icon && <span>{icon}</span>}
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left Section - Logo & Links */}
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow duration-300">
              J
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent hidden sm:inline">
              JobPortal
            </span>
          </Link>

          {/* Desktop Links - Different for Employer and Applicant */}
          <div className="hidden lg:flex items-center gap-8">
            {isEmployer ? (
              <>{navLink("/home/job/posted", "Posted Jobs", "📋")}</>
            ) : isApplicant ? (
              <>
                {navLink("/home", "Home", "🏠")}

                {navLink("/home/my-applications", "My Applications", "📄")}
              </>
            ) : (
              <>{navLink("/home", "Home", "🏠")}</>
            )}
          </div>
        </div>

        {/* Center - Dynamic Search/Filter Bar */}
        {!isEmployer && (
          <div className="hidden md:flex flex-1 max-w-sm mx-6">
            <div className="relative w-full group">
              <input
                type="text"
                placeholder={
                  isApplicant
                    ? "Search jobs by title, skills..."
                    : "Search jobs, companies..."
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm transition-all duration-300 placeholder:text-gray-500"
              />
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Right Section */}
        <div ref={closeMenuRef} className="hidden lg:flex items-center gap-4">
          {/* Employer - Post Job Button */}
          {isEmployer && (
            <Link
              href="/home/job/register"
              className="group relative px-5 py-2.5 rounded-lg bg-linear-to-r from-green-600 to-green-700 text-white text-sm font-semibold overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Post a Job
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-green-700 to-green-800 transform scale-x-0 origin-right transition-transform duration-300 group-hover:scale-x-100 group-hover:origin-left -z-10" />
            </Link>
          )}

          {/* Applicant - Saved Jobs Button */}
          {isApplicant && (
            <Link
              href="/home/saved-jobs"
              className="group relative px-5 py-2.5 rounded-lg bg-linear-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
                Saved Jobs
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-purple-700 to-purple-800 transform scale-x-0 origin-right transition-transform duration-300 group-hover:scale-x-100 group-hover:origin-left -z-10" />
            </Link>
          )}

          {/* Auth Buttons */}
          {!isAuthenticated ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
              >
                Login
              </Link>
              <div className="relative group">
                <button className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  Sign Up
                </button>
                {/* Sign Up Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link
                    href="/register?role=job_seeker"
                    className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    👤 As a Job Seeker
                  </Link>
                  <Link
                    href="/register?role=employer"
                    className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    🏢 As an Employer
                  </Link>
                </div>
              </div>
            </>
          ) : (
            /* Profile Dropdown */
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
              >
                <div
                  className={`w-9 h-9 rounded-full text-white flex items-center justify-center font-semibold text-sm shadow-md hover:shadow-lg transition-shadow duration-300 ${
                    isEmployer
                      ? "bg-linear-to-br from-green-500 to-green-600"
                      : "bg-linear-to-br from-blue-500 to-blue-600"
                  }`}
                >
                  {isEmployer ? "E" : "A"}
                </div>
                <svg
                  className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <div
                  ref={closeMenuRef}
                  className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 animate-in fade-in zoom-in-95 duration-200 z-50"
                >
                  {/* Profile Header */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Account
                    </p>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {isEmployer ? "Employer" : "Job Seeker"}
                    </p>
                  </div>

                  {/* Menu Items */}
                  {isEmployer ? (
                    <>
                      <Link
                        href="/home/company"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                      >
                        👤 Company Profile
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/home/profile"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                      >
                        👤 My Profile
                      </Link>
                    </>
                  )}

                  <hr className="my-2 border-gray-100" />

                  {/* Logout */}
                  <button
                    onClick={() => handleLogout()}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
          aria-label="Toggle menu"
        >
          <svg
            className={`w-6 h-6 text-gray-700 transition-transform duration-300 ${
              menuOpen ? "rotate-90" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Mobile Search */}
          {!isEmployer && (
            <div className="relative mb-4">
              <input
                type="text"
                placeholder={
                  isApplicant ? "Search jobs..." : "Search jobs, companies..."
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm"
              />
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          )}

          {/* Mobile Navigation Links */}
          <div className="space-y-2">
            {isEmployer ? (
              <>
                <Link
                  href="/home/job/posted"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                >
                  📋 Posted Jobs
                </Link>
              </>
            ) : isApplicant ? (
              <>
                <Link
                  href="/home"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                >
                  🏠 Home
                </Link>

                <Link
                  href="/home/my-applications"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                >
                  📄 My Applications
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/home"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                >
                  🏠 Home
                </Link>
              </>
            )}
          </div>

          {/* Mobile CTA Buttons */}
          {isEmployer && (
            <Link
              href="/employer/post-job"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg bg-green-600 text-white text-center font-semibold hover:bg-green-700 transition-colors duration-300"
            >
              ➕ Post a Job
            </Link>
          )}

          {isApplicant && (
            <Link
              href="/home/saved-jobs"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg bg-purple-600 text-white text-center font-semibold hover:bg-purple-700 transition-colors duration-300"
            >
              📌 Saved Jobs
            </Link>
          )}

          {/* Mobile Auth Section */}
          {!isAuthenticated ? (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <Link
                href="/login"
                className="block px-4 py-2.5 text-center rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors duration-200"
              >
                Login
              </Link>
              <div className="space-y-2">
                <Link
                  href="/register?role=job_seeker"
                  className="block px-4 py-2.5 text-center rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors duration-300"
                >
                  Sign Up as Job Seeker
                </Link>
                <Link
                  href="/register?role=employer"
                  className="block px-4 py-2.5 text-center rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors duration-300"
                >
                  Sign Up as Employer
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              {isEmployer ? (
                <>
                  <Link
                    href="/employer/profile"
                    className="block px-4 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    👤 Company Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/home/profile"
                    className="block px-4 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    👤 My Profile
                  </Link>
                </>
              )}

              <button
                onClick={() => handleLogout()}
                className="w-full px-4 py-2.5 rounded-lg text-red-600 font-medium hover:bg-red-50 transition-colors duration-200"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
