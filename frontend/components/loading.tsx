"use client";

import { FC } from "react";

interface LoadingProps {
  variant?:
    | "spinner"
    | "dots"
    | "bars"
    | "pulse"
    | "orbit"
    | "wave"
    | "gradient";
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

const Loading: FC<LoadingProps> = ({
  variant = "spinner",
  size = "md",
  text = "Loading...",
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-40 h-40",
    lg: "w-50 h-50",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm z-50"
    : "flex flex-col items-center justify-center";

  const renderLoading = () => {
    switch (variant) {
      case "spinner":
        return (
          <div className={sizeClasses[size]}>
            <svg
              className="animate-spin text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
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
          </div>
        );

      case "dots":
        return (
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${
                  size === "sm"
                    ? "w-2 h-2"
                    : size === "md"
                      ? "w-3 h-3"
                      : "w-4 h-4"
                } bg-blue-600 rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        );

      case "bars":
        return (
          <div className="flex items-end gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`bg-linear-to-t from-blue-600 to-blue-400 rounded-full animate-pulse`}
                style={{
                  width: size === "sm" ? "4px" : size === "md" ? "6px" : "8px",
                  height:
                    size === "sm" ? "16px" : size === "md" ? "24px" : "32px",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        );

      case "pulse":
        return (
          <div
            className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-pulse`}
            style={{
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
        );

      case "orbit":
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 animate-spin">
              <div className="absolute top-0 left-1/2 w-1 h-1 bg-blue-600 rounded-full -translate-x-1/2" />
              <div className="absolute top-0 right-0 w-1 h-1 bg-blue-500 rounded-full opacity-60" />
              <div className="absolute bottom-0 right-0 w-1 h-1 bg-blue-400 rounded-full opacity-40" />
            </div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 border-r-blue-300 rounded-full" />
          </div>
        );

      case "wave":
        return (
          <svg
            className={`${sizeClasses[size]} text-blue-600`}
            viewBox="0 0 120 30"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <style>
                {`
                  @keyframes wave {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-10px); }
                  }
                  .wave-path { animation: wave 1.2s infinite; }
                `}
              </style>
            </defs>
            {[0, 15, 30, 45, 60, 75, 90, 105].map((x, i) => (
              <circle
                key={i}
                cx={x}
                cy="15"
                r="5"
                fill="currentColor"
                style={{ animationDelay: `${i * 0.1}s` }}
                className="wave-path"
              />
            ))}
          </svg>
        );

      case "gradient":
        return (
          <div
            className={`${sizeClasses[size]} relative overflow-hidden rounded-full`}
          >
            <div className="absolute inset-0 bg-linear-to-r from-blue-600 via-purple-600 to-blue-600 animate-spin" />
            <div className={`absolute inset-1 bg-white rounded-full`} />
            <div className="absolute inset-0 animate-spin opacity-50">
              <div className="absolute top-0 left-1/2 w-1 h-1 bg-blue-600 rounded-full -translate-x-1/2" />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        {renderLoading()}
        {text && (
          <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;
