import { redirect } from "react-router";
import axiosInstance from "@/services/api";

// Root layout loader - fetches current user data
export default async function rootLayoutLoader() {
  try {
    // Fetch current user data - HttpOnly cookie is automatically sent
    const response = await axiosInstance.get("/auth/me");
    return response.data.data.user;
  } catch (error) {
    // If authentication fails, redirect to login
    if (error.response?.status === 401) {
      return redirect("/");
    }
    throw error;
  }
}
