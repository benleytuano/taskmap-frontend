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

    // Redirect to dashboard on successful login
    return redirect("/dashboard");
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
