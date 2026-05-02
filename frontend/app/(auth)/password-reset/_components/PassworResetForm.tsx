"use client";

import React, { useState } from "react";

// import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { PasswordRequirements } from "./PasswordRequirements";
import { PasswordInput } from "./PasswordInput";

interface PasswordResetFormProps {
  onSubmit?: (newPassword: string, confirmPassword: string) => void;
  isLoading?: boolean;
}

export const PasswordResetForm = ({
  onSubmit,
  isLoading = false,
}: PasswordResetFormProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isPasswordsMatch =
    newPassword === confirmPassword && newPassword !== "";
  const isFormValid =
    newPassword.length >= 8 && confirmPassword.length >= 8 && isPasswordsMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(newPassword, confirmPassword);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <PasswordInput
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="Enter your new password"
          showPasswordToggle
        />
        <PasswordRequirements password={newPassword} />
      </div>

      <div>
        <PasswordInput
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirm your password"
          showPasswordToggle
          error={
            confirmPassword && !isPasswordsMatch
              ? "Passwords do not match"
              : undefined
          }
          successMessage={
            confirmPassword && isPasswordsMatch ? "Passwords match" : undefined
          }
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-800">
          💡 <strong>Tip:</strong> Use a unique password that you don't use
          anywhere else.
        </p>
      </div>

      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
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
            Resetting...
          </>
        ) : (
          <>🔐 Reset Password</>
        )}
      </button>
    </form>
  );
};
