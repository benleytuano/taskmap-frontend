import { redirect } from "react-router";
import axiosInstance from "@/services/api";

// Root layout loader - fetches current user data and watched tasks count
export default async function rootLayoutLoader() {
  try {
    // Fetch current user data - HttpOnly cookie is automatically sent
    const userResponse = await axiosInstance.get("/auth/me");
    const user = userResponse.data.data.user;

    // Fetch watching tasks to determine count
    let watchedTasksCount = 0;
    try {
      const watchingResponse = await axiosInstance.get("/watching-tasks");
      watchedTasksCount = watchingResponse.data?.data?.watched_tasks_count || 0;
    } catch (error) {
      // If watching tasks fetch fails, just set count to 0
      console.error("Failed to fetch watching tasks:", error);
    }

    return {
      ...user,
      watchedTasksCount
    };
  } catch (error) {
    // If authentication fails, redirect to login
    if (error.response?.status === 401) {
      return redirect("/");
    }
    throw error;
  }
}
