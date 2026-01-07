import axiosInstance from "@/services/api";
import { redirect } from "react-router";

export default async function dashboardLoader() {
  try {
    // Fetch events from the API
    const response = await axiosInstance.get("/events");
    return { events: response.data?.data || [] };
  } catch (error) {
    console.error("Failed to fetch events:", error);
    // If unauthorized, redirect to login
    if (error.response?.status === 401) {
      return redirect("/");
    }
    // Return empty array on other errors
    return { events: [] };
  }
}
