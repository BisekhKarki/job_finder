"use client";

import { useState } from "react";
import { PasswordResetForm } from "../../_components/PassworResetForm";
import { PasswordResetSuccess } from "../../_components/PasswordResetSuccess";
import { useParams } from "next/navigation";
import { baseurl } from "@/lib/baseurl";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  console.log(params);

  const handleSubmit = async (newPassword: string, confirmPassword: string) => {
    if (!confirmPassword || !newPassword || newPassword !== confirmPassword) {
      return toast.error("Password length or password has not been provided");
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${baseurl}/api/accounts/reset-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: newPassword,
          token: params.token,
          uuid: params.uuid,
        }),
      });
      const val = await response.json();
      if (response.ok) {
        setIsSubmitted(true);
        return toast.success(val.message);
      } else {
        return toast.error(val.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {!isSubmitted ? (
            <>
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Create New Password
                </h1>
                <p className="text-gray-600">
                  Enter a strong password to secure your account
                </p>
              </div>
              <PasswordResetForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </>
          ) : (
            <PasswordResetSuccess
              onBackToLogin={() => (window.location.href = "/login")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
