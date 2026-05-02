"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";
import { baseurl } from "@/lib/baseurl";
import useLocalStorage from "@/hooks/useLocalStorage";
import toast from "react-hot-toast";

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { setToken } = useLocalStorage();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      const response = await fetch(`${baseurl}/api/accounts/auth-tokens/`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });

      const val = await response.json();

      if (response.ok) {
        toast.success("User logged in successfull", {
          position: "bottom-right",
        });
        setToken({
          access: val.access,
          refresh: val.refresh,
        });
        return;
      }

      return toast.error(val.detail, {
        position: "bottom-right",
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-200 px-4">
      {/* Card */}
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Top Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              JobPortal
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Sign in to access jobs and opportunities
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email format",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end text-sm">
              <Link
                href="/reset-password"
                className="text-blue-600 hover:text-blue-800 transition"
              >
                Forgot password?
              </Link>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="text-blue-600 font-semibold hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
