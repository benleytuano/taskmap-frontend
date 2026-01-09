import axiosInstance from "@/services/api";
import { redirect } from "react-router";

export default async function taskDetailsLoader({ params }) {
  try {
    const taskId = params.taskId;

    // Fetch task details - HttpOnly cookie is automatically sent with request
    const response = await axiosInstance.get(`/tasks/${taskId}`);

    return {
      task: response.data?.data?.task || null,
    };
  } catch (error) {
    console.error("Failed to fetch task details:", error);

    // Handle errors
    if (error.response?.status === 401) {
      return redirect("/"); // Redirect if unauthorized
    }

    if (error.response?.status === 404) {
      return redirect("/dashboard"); // Redirect if task not found
    }

    // Return empty task on other errors
    return { task: null };
  }
}
