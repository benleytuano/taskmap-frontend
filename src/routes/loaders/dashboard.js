import axiosInstance from "@/services/api";
import { redirect } from "react-router";

export default async function dashboardLoader() {
  try {
    // Check user role - only admin can access dashboard
    const userResponse = await axiosInstance.get("/auth/me");
    const userRole = userResponse.data?.data?.user?.role;

    if (userRole !== "admin") {
      return redirect("/dashboard/my-tasks");
    }

    // Fetch tasks from the API
    const response = await axiosInstance.get("/tasks");
    return { events: response.data?.data?.tasks || [] };
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    // If unauthorized, redirect to login
    if (error.response?.status === 401) {
      return redirect("/");
    }
    // Return empty array on other errors
    return { events: [] };
  }
}
