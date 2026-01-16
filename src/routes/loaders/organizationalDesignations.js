import axiosInstance from "@/services/api";
import { redirect } from "react-router";

export default async function organizationalDesignationsLoader() {
  try {
    const response = await axiosInstance.get("/organizational-designations");
    return {
      designations: response.data?.data?.designations || []
    };
  } catch (error) {
    if (error.response?.status === 401) {
      return redirect("/");
    }
    if (error.response?.status === 403) {
      // Not a superadmin, redirect to dashboard
      return redirect("/dashboard");
    }
    return { designations: [] };
  }
}
