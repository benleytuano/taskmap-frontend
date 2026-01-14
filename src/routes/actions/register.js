import axiosInstance from "@/services/api";
import { redirect } from "react-router";

export async function registerAction({ request }) {
  const formData = await request.formData();

  // Get form values
  const employeeIdFull = formData.get("employee_id_full");
  const surname = formData.get("surname");
  const firstname = formData.get("firstname");
  const middlename = formData.get("middlename");
  const email = formData.get("email");
  const section = formData.get("section");
  const position = formData.get("position");
  const password = formData.get("password");
  const passwordConfirmation = formData.get("password_confirmation");

  // Validate password match
  if (password !== passwordConfirmation) {
    return { error: "Passwords do not match" };
  }

  // Validate employee ID format
  if (!employeeIdFull || !employeeIdFull.startsWith("03-") || employeeIdFull.length !== 8) {
    return { error: "Employee ID must be in format 03-XXXXX (5 digits)" };
  }

  // Prepare payload - normalize only email and employee_id to lowercase
  // Keep names in uppercase as typed
  const payload = {
    employee_id: employeeIdFull.toLowerCase(),
    surname: surname.toUpperCase(),
    first_name: firstname.toUpperCase(),
    middle_name: middlename.toUpperCase(),
    email: email.toLowerCase(),
    password: password,
    password_confirmation: passwordConfirmation,
    role: "user",
    section: section,
    position: position,
  };

  try {
    const response = await axiosInstance.post("/auth/register", payload);

    // Redirect to login page on success
    return redirect("/?registered=true");
  } catch (error) {
    // Handle validation errors
    if (error.response?.status === 422) {
      const errors = error.response.data?.errors;
      if (errors) {
        // Return the first error message
        const firstError = Object.values(errors)[0];
        return { error: Array.isArray(firstError) ? firstError[0] : firstError };
      }
      return { error: "Validation failed. Please check your inputs." };
    }

    // Handle duplicate entry
    if (error.response?.status === 409) {
      return { error: "Employee ID or email already exists" };
    }

    // Handle other errors
    if (error.response?.data?.message) {
      return { error: error.response.data.message };
    }

    return { error: "An error occurred during registration. Please try again." };
  }
}
