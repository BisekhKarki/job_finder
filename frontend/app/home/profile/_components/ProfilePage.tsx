"use client";

import { useEffect, useState } from "react";
import ProfilePasswordChange from "./ProfilePasswordChange";
import useLocalStorage from "@/hooks/useLocalStorage";

import { baseurl } from "@/lib/baseurl";
import toast from "react-hot-toast";
import Image from "next/image";

export const validate = 0;

interface UserProps {
  id: number;
  username: string;
  email: string;
  role: "applicant" | "employer";
  bio: string;
  avatar?: string;
  created_at?: string;
  phone?: string;
  address?: string;
  account_status?: boolean;
}

const ProfilePage = () => {
  const { accessToken, hydrated } = useLocalStorage();
  const [userDetails, setUserDetails] = useState<UserProps | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProps | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (!hydrated) return;
        if (!accessToken) return;

        const response = await fetch(`${baseurl}/api/accounts/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const val = await response.json();
        console.log(val);

        setUserDetails(val.user);
        setFormData(val.user);
      } catch (error) {
        console.log("FETCH ERROR:", error);
      }
    };

    fetchUserDetails();
  }, [accessToken, hydrated]);

  const [activeTab, setActiveTab] = useState<
    "profile" | "password" | "settings"
  >("profile");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userDetails) return;
    console.log(file);

    setUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("avatar", file);

      const response = await fetch(
        `${baseurl}/api/accounts/auth/update-profile/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formDataToSend,
        },
      );

      if (response.ok) {
        const data = await response.json();
        setUserDetails(data.updated_user || userDetails);
        setFormData(data.updated_user || userDetails);
        toast.success("Profile image updated successfully");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!formData || !userDetails) return;
    // console.log(formData);

    try {
      const response = await fetch(
        `${baseurl}/api/accounts/auth/update-profile/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            bio: formData.bio,
            phone: formData.phone,
            address: formData.address,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        setUserDetails(data.updated_user || formData);
        setIsEditing(false);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  const getAvatarColor = (username: string) => {
    const colors = [
      "from-blue-500 to-blue-700",
      "from-purple-500 to-purple-700",
      "from-pink-500 to-pink-700",
      "from-green-500 to-green-700",
      "from-indigo-500 to-indigo-700",
      "from-cyan-500 to-cyan-700",
    ];
    const hash = username
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* User Information Header */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Cover Background */}
          <div className="h-32 bg-linear-to-r from-blue-600 via-blue-500 to-purple-600"></div>

          {/* User Info Section */}
          <div className="px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:gap-6">
              {/* Avatar */}
              <div className="shrink-0 -mt-20 mb-4 sm:mb-0 relative group">
                <div
                  className={`w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-linear-to-br ${getAvatarColor(
                    userDetails?.username || "User",
                  )} flex items-center justify-center`}
                >
                  {userDetails && userDetails?.avatar ? (
                    <img
                      src={`${baseurl}${userDetails.avatar}`}
                      alt={userDetails?.username}
                      // width={100}
                      // height={100}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl font-bold text-white">
                      {getInitials(userDetails?.username || "U")}
                    </span>
                  )}
                </div>

                {/* Upload Button Overlay */}
                <label className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-white text-sm font-semibold">
                    📷 Change
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>

              {/* User Details */}
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  {userDetails?.username}
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  {userDetails?.bio || "No bio added yet"}
                </p>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">
                      Account Type
                    </p>
                    <p className="text-sm font-bold text-blue-600 capitalize">
                      {userDetails?.role}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">
                      Email
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {userDetails?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">
                      Phone
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {userDetails?.phone || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">
                      Member Since
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {userDetails?.created_at
                        ? new Date(userDetails.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Profile Button */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-lg whitespace-nowrap"
              >
                {isEditing ? "✕ Cancel" : "✏️ Edit Profile"}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs and Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Account Settings
              </h3>

              {/* Tab Navigation */}
              <div className="space-y-2">
                {(
                  [
                    { id: "profile", label: "🎯 Profile", icon: "profile" },
                    // { id: "password", label: "🔒 Password", icon: "password" },
                    { id: "settings", label: "⚙️ Settings", icon: "settings" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-700 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Account Status */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="bg-linear-to-r from-green-50 to-green-100 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-semibold mb-1">
                    Account Status
                  </p>
                  <p className="text-sm font-bold text-green-700">
                    ✓ {userDetails?.account_status ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {/* Profile Tab Content */}
              {activeTab === "profile" && userDetails && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      {isEditing ? "Edit Profile" : "Profile Information"}
                    </h2>
                  </div>

                  {isEditing ? (
                    // Edit Mode
                    <div className="space-y-6">
                      {/* Bio */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          value={formData?.bio || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData!,
                              bio: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all duration-300 resize-none"
                          rows={4}
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData?.phone || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData!,
                              phone: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all duration-300"
                          placeholder="Your phone number"
                        />
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          value={formData?.address || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData!,
                              address: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all duration-300"
                          placeholder="Your address"
                        />
                      </div>

                      {/* Save Button */}
                      <button
                        onClick={handleProfileUpdate}
                        className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                      >
                        💾 Save Changes
                      </button>
                    </div>
                  ) : (
                    // View Mode
                    <ProfilePasswordChange {...userDetails} />
                  )}
                </div>
              )}

              {/* Password Tab Content */}
              {activeTab === "password" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Change Password
                    </h2>
                  </div>

                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all duration-300"
                      placeholder="Enter your current password"
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all duration-300"
                      placeholder="Enter a new password"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all duration-300"
                      placeholder="Confirm your new password"
                    />
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      🔐 <strong>Password Requirements:</strong> At least 6
                      characters. Use a combination of letters, numbers, and
                      symbols.
                    </p>
                  </div>

                  {/* Change Password Button */}
                  <button className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                    🔒 Update Password
                  </button>
                </div>
              )}

              {/* Settings Tab Content */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Account Settings
                    </h2>
                  </div>

                  {/* Account Information */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          Account ID
                        </p>
                        <p className="text-gray-600">#{userDetails?.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          Member Since
                        </p>
                        <p className="text-gray-600">
                          {userDetails?.created_at
                            ? new Date(
                                userDetails.created_at,
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          Email Notifications
                        </p>
                        <p className="text-gray-600">Enabled</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          Two-Factor Authentication
                        </p>
                        <p className="text-gray-600">Disabled</p>
                      </div>
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                        Enable
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          Privacy Setting
                        </p>
                        <p className="text-gray-600">Public Profile</p>
                      </div>
                      <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10">
                        <option>Public</option>
                        <option>Private</option>
                      </select>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="border-t pt-6 mt-6">
                    <h4 className="text-lg font-bold text-red-600 mb-4">
                      ⚠️ Danger Zone
                    </h4>
                    <button className="w-full px-4 py-3 rounded-lg border-2 border-red-300 text-red-600 font-semibold hover:bg-red-50 transition-colors duration-300">
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
