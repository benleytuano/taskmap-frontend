import axiosInstance from "@/services/api";
import { redirect } from "react-router";

export default async function dashboardLoader() {
  // TODO: Implement /auth/verify endpoint in Laravel backend
  // For now, just return empty object to allow dashboard access after login
  return {};

  // Uncomment below when /auth/verify is implemented:
  /*
  try {
    // Verify authentication by calling a protected endpoint
    // The HttpOnly cookie is automatically sent with the request
    const response = await axiosInstance.get("/auth/verify");
    return response.data; // Return user data if authenticated
  } catch (error) {
    // If verification fails, redirect to login
    console.error("Auth verification failed:", error);
    return redirect("/");
  }
  */
}
