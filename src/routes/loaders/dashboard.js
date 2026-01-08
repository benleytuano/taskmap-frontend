import axiosInstance from "@/services/api";
import { redirect } from "react-router";

export default async function dashboardLoader() {
  try {
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
