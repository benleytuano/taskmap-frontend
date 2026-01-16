import axiosInstance from "@/services/api";
import { redirect } from "react-router";

export async function createOrganizationalDesignationAction({ request }) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  // Handle delete intent
  if (intent === "delete") {
    const designationId = formData.get("designationId");
    try {
      await axiosInstance.delete(`/organizational-designations/${designationId}`);
      return { success: true, message: "Designation deleted successfully" };
    } catch (error) {
      return {
        error: error.response?.data?.message || "Failed to delete designation"
      };
    }
  }

  // Handle update intent
  if (intent === "update") {
    const designationId = formData.get("designationId");
    const userId = formData.get("user_id");
    const organizationalTitle = formData.get("organizational_title");
    const taskSourceLabel = formData.get("task_source_label");
    const isDivisionHead = formData.get("is_division_head") === "true";

    try {
      await axiosInstance.put(`/organizational-designations/${designationId}`, {
        user_id: parseInt(userId),
        organizational_title: organizationalTitle,
        task_source_label: taskSourceLabel,
        is_division_head: isDivisionHead,
      });
      return { success: true, message: "Designation updated successfully" };
    } catch (error) {
      return {
        error: error.response?.data?.message || "Failed to update designation"
      };
    }
  }

  // Handle create intent (default)
  const userId = formData.get("user_id");
  const organizationalTitle = formData.get("organizational_title");
  const taskSourceLabel = formData.get("task_source_label");
  const isDivisionHead = formData.get("is_division_head") === "true";

  try {
    await axiosInstance.post("/organizational-designations", {
      user_id: parseInt(userId),
      organizational_title: organizationalTitle,
      task_source_label: taskSourceLabel,
      is_division_head: isDivisionHead,
    });
    return { success: true, message: "Designation created successfully" };
  } catch (error) {
    return {
      error: error.response?.data?.message || "Failed to create designation"
    };
  }
}
