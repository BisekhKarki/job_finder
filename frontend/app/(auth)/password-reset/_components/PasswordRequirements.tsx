"use client";

interface PasswordRequirementsProps {
  password: string;
}

export const PasswordRequirements = ({
  password,
}: PasswordRequirementsProps) => {
  const requirements = [
    {
      label: "At least 8 characters",
      met: password.length >= 8,
    },
    {
      label: "Mix of uppercase and lowercase",
      met: /[A-Z]/.test(password) && /[a-z]/.test(password),
    },
    {
      label: "At least one number",
      met: /[0-9]/.test(password),
    },
    {
      label: "At least one special character (!@#$%^&*)",
      met: /[^a-zA-Z0-9]/.test(password),
    },
  ];

  return (
    <div className="mt-3 space-y-2">
      {requirements.map((req, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs ${
              req.met ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            {req.met ? "✓" : ""}
          </div>
          <span className="text-xs text-gray-600">{req.label}</span>
        </div>
      ))}
    </div>
  );
};
