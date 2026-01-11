import axiosInstance from "@/services/api";
import { redirect } from "react-router";

export default async function myTasksLoader() {
  try {
    // Check user role - only regular users can access my-tasks
    const userResponse = await axiosInstance.get("/auth/me");
    const userRole = userResponse.data?.data?.user?.role;

    if (userRole === "admin") {
      return redirect("/dashboard");
    }

    // Fetch user's assignments from the API
    const response = await axiosInstance.get("/my-tasks");
    return { assignments: response.data?.data?.assignments || [] };
  } catch (error) {
    console.error("Failed to fetch my tasks:", error);
    // If unauthorized, redirect to login
    if (error.response?.status === 401) {
      return redirect("/");
    }
    // Return empty array on other errors
    return { assignments: [] };
  }
}
