"use client";

interface PasswordResetSuccessProps {
  onBackToLogin?: () => void;
}

export const PasswordResetSuccess = ({
  onBackToLogin,
}: PasswordResetSuccessProps) => {
  return (
    <div className="text-center">
      {/* Success Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center animate-bounce">
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
        Password Reset Successful!
      </h2>
      <p className="text-gray-600 mb-6">
        Your password has been changed successfully. You can now log in with
        your new password.
      </p>

      {/* Success Details */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
        <ul className="text-sm text-green-800 space-y-2">
          <li className="flex items-center gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Password updated successfully</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Your account is now secure</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>You can log in immediately</span>
          </li>
        </ul>
      </div>

      {/* Action Button */}
      <button
        onClick={onBackToLogin}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
      >
        Back to Login
      </button>
    </div>
  );
};
