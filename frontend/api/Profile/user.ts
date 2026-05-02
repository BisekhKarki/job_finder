"use server";

import { baseurl } from "@/lib/baseurl";

export const myProfile = async (token: string | null, url: string) => {
  if (!token) {
    return { error: "No access token provided", status: 401 };
  }

  try {
    const response = await fetch(`${baseurl}${url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const val = await response.json();

    console.log(val);

    if (!response.ok) {
      return {
        error: val.detail || "Failed to fetch profile",
        status: response.status,
      };
    }

    return val;
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return { error: "Internal Server Error", status: 500 };
  }
};
