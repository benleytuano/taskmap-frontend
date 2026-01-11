import axiosInstance from "@/services/api";
import { redirect } from "react-router";

export default async function userTaskDetailsLoader({ params }) {
  try {
    // Check user role - only regular users can access this page
    const userResponse = await axiosInstance.get("/auth/me");
    const currentUser = userResponse.data?.data?.user;
    const userRole = currentUser?.role;

    if (userRole === "admin") {
      // Redirect admin to the admin task details page
      // For admin, we'd need the task ID, but we only have assignment ID
      // Fetch the assignment first to get the task ID
      const assignmentResponse = await axiosInstance.get(`/my-tasks/${params.assignmentId}`);
      const taskId = assignmentResponse.data?.data?.assignment?.task_id;
      return redirect(`/dashboard/tasks/${taskId}`);
    }

    // Fetch assignment details (includes full task data)
    const response = await axiosInstance.get(`/my-tasks/${params.assignmentId}`);
    const assignment = response.data?.data?.assignment;

    if (!assignment) {
      throw new Response("Assignment not found", { status: 404 });
    }

    // Extract task and assignment data
    const task = assignment.task;
    const userAssignment = assignment;

    return { task, userAssignment, currentUser };
  } catch (error) {
    console.error("Failed to fetch assignment details:", error);

    // If unauthorized, redirect to login
    if (error.response?.status === 401) {
      return redirect("/");
    }

    // If forbidden (not your assignment), redirect to my-tasks
    if (error.response?.status === 403) {
      return redirect("/dashboard/my-tasks");
    }

    // If not found
    if (error.response?.status === 404) {
      return redirect("/dashboard/my-tasks");
    }

    throw error;
  }
}
