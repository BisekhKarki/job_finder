"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";
import toast from "react-hot-toast";
import { baseurl } from "@/lib/baseurl";
import { useRouter } from "next/navigation";

type SignupFormInputs = {
  username: string;
  email: string;
  password: string;
  role: "employer" | "applicant";
};

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignupFormInputs>({
    defaultValues: {
      role: "applicant",
    },
  });

  const onSubmit: SubmitHandler<SignupFormInputs> = async (data) => {
    try {
      console.log(data);
      const response = await fetch(`${baseurl}/api/accounts/register/`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });

      const val = await response.json();

      if (response.ok) {
        toast.success("User registered successfully", {
          position: "bottom-right",
        });

        router.push("/login");
        reset();
        return;
      }

      return toast.error(val.detail || "Registration failed", {
        position: "bottom-right",
      });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      reset();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-200 px-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Accent */}
        <div className="h-2 bg-gradient-to-r from-indigo-600 to-blue-600" />

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">JobPortal</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Create your account to get started
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                placeholder="johndoe"
                className="w-full mt-1 px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                {...register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Minimum 3 characters",
                  },
                })}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full mt-1 px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                placeholder="••••••••"
                className="w-full mt-1 px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Minimum 6 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Role Selection 👇 */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Select Role
              </label>

              <select
                className="w-full mt-1 px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                {...register("role", {
                  required: "Role is required",
                })}
              >
                <option value="applicant">Applicant</option>
                <option value="employer">Employer</option>
              </select>

              {errors.role && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 active:scale-[0.99] transition disabled:opacity-60"
            >
              {isSubmitting ? "Creating account..." : "Sign up"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
