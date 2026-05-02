"use client";

import { baseurl } from "@/lib/baseurl";
import React, { useState } from "react";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`${baseurl}/api/accounts/password-reset/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });
      const val = await response.json();
      console.log(val);
      if (response.ok) {
        setIsSubmitted(true);
        toast.success(val.message);
      } else {
        toast.error(val);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {/* Illustration / Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-100 to-blue-50 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Forgot Password?
                </h1>
                <p className="text-gray-600">
                  No worries! Enter your email and we'll send you a link to
                  reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all duration-300 text-gray-900 placeholder-gray-500"
                    placeholder="Enter your email address"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    We'll send a password reset link to this email
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  🔗 Send Reset Link
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Back to Login */}
              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors duration-300"
              >
                ← Back to Login
              </button>

              {/* Info Box */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-800">
                  💡 <strong>Tip:</strong> Check your spam folder if you don't
                  see the email in your inbox.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-linear-to-br from-green-100 to-green-50 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Check Your Email!
                </h2>
                <p className="text-gray-600 mb-2">
                  We've sent a password reset link to:
                </p>
                <p className="text-lg font-semibold text-blue-600 mb-4">
                  {email}
                </p>

                {/* Instructions */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    What happens next:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">1.</span>
                      <span>Check your email (including spam folder)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">2.</span>
                      <span>Click the password reset link</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">3.</span>
                      <span>Create your new password</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">4.</span>
                      <span>Log in with your new password</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <button
                  onClick={() => (window.location.href = "/login")}
                  className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 mb-3"
                >
                  Back to Login
                </button>

                <button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors duration-300"
                >
                  Try Another Email
                </button>

                {/* Resend Option */}
                <p className="text-xs text-gray-500 mt-4">
                  Didn't receive the email?{" "}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Resend
                  </button>
                </p>
              </div>
            </>
          )}
        </div>

        {!isSubmitted && (
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              Remember your password?{" "}
              <a
                href="/login"
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign in here
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
