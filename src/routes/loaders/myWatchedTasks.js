import axiosInstance from "@/services/api";
import { redirect } from "react-router";

export default async function myWatchedTasksLoader() {
  try {
    // No role check - available to all authenticated users
    const response = await axiosInstance.get("/watching-tasks");
    const watchedTasks = response.data?.data?.watched_tasks || [];

    // Transform priority from string to object format for consistency
    const transformedTasks = watchedTasks.map((task) => ({
      ...task,
      priority: {
        value: task.priority,
        label:
          task.priority === "urgent"
            ? "Urgent"
            : task.priority === "rush"
            ? "Rush"
            : "Standard",
      },
    }));

    return { tasks: transformedTasks };
  } catch (error) {
    console.error("Failed to fetch watched tasks:", error);
    // If unauthorized, redirect to login
    if (error.response?.status === 401) {
      return redirect("/");
    }
    // Return empty array on other errors
    return { tasks: [] };
  }
}
