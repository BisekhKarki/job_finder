import React from "react";

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  role: "applicant" | "employer";
  bio: string;
  avatar?: string;
  createdAt?: string;
  phone?: string;
  location?: string;
}

const ProfilePasswordChange = ({
  id,
  username,
  email,
  role,
  bio,
  avatar,
  createdAt,
  phone,
  location,
}: UserInfo) => {
  console.log(username);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Profile Information
        </h2>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Username Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            defaultValue={username}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all duration-300"
            placeholder="Enter your username"
          />
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            defaultValue={email}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all duration-300"
            placeholder="Enter your email"
          />
        </div>

        {/* Phone Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            defaultValue={phone}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all duration-300"
            placeholder="Enter your phone number"
          />
        </div>

        {/* Location Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            defaultValue={location}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all duration-300"
            placeholder="Enter your location"
          />
        </div>
      </div>

      {/* Bio Field */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          defaultValue={bio}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all duration-300 resize-none"
          placeholder="Tell us about yourself..."
        />
      </div>

      <button className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
        💾 Save Changes
      </button>
    </div>
  );
};

export default ProfilePasswordChange;
