import axiosInstance from "@/services/api";
import { redirect } from "react-router";

export async function loginAction({ request }) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    // Send login request to backend
    // Backend will set HttpOnly cookie on success
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });

    // Get user role from response
    const userRole = response.data?.data?.user?.role;

    // Redirect based on user role
    if (userRole === "admin") {
      return redirect("/dashboard");
    } else {
      return redirect("/dashboard/my-tasks");
    }
  } catch (error) {
    // Return error message to display in form
    if (error.response?.status === 401) {
      return { error: "Invalid email or password" };
    }

    if (error.response?.data?.message) {
      return { error: error.response.data.message };
    }

    return { error: "An error occurred. Please try again." };
  }
}
