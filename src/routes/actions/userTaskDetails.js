import axiosInstance from "@/services/api";

export async function userTaskDetailsAction({ request, params }) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    if (intent === "update-assignment") {
      const assignmentId = formData.get("assignment_id");
      const status = formData.get("status");
      const originalStatus = formData.get("original_status");
      const progressNote = formData.get("progress_note");

      // Debug logging
      console.log("Update Assignment Request:", {
        assignmentId,
        status,
        originalStatus,
        statusChanged: status !== originalStatus,
        endpoint: `/my-tasks/${assignmentId}/update`
      });

      // Check if there are file attachments
      const files = formData.getAll("attachments[]");
      const hasFiles = files.some((file) => file instanceof File && file.size > 0);

      // Only send status if it actually changed
      const statusChanged = status !== originalStatus;

      // Use new POST endpoint (Option 1 - RECOMMENDED)
      const updateData = new FormData();

      // Only include fields that are provided/changed
      if (statusChanged && status) {
        updateData.append("status", status);
      }

      if (progressNote) {
        updateData.append("progress_note", progressNote);
      }

      // Add files with correct parameter name: attachments[]
      if (hasFiles) {
        files.forEach((file) => {
          if (file instanceof File && file.size > 0) {
            updateData.append("attachments[]", file);
          }
        });
      }

      // Check if there are any updates to send
      let hasUpdates = false;
      for (let pair of updateData.entries()) {
        hasUpdates = true;
        break;
      }

      if (!hasUpdates) {
        return {
          success: false,
          message: "No changes to save",
        };
      }

      // Use new POST endpoint: /my-tasks/{assignment}/update
      const response = await axiosInstance.post(
        `/my-tasks/${assignmentId}/update`,
        updateData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return {
        success: true,
        message: response.data?.message || "Assignment updated successfully",
      };
    }

    if (intent === "submit-for-review") {
      const assignmentId = formData.get("assignment_id");

      const response = await axiosInstance.post(`/my-tasks/${assignmentId}/submit`);

      return {
        success: true,
        message: response.data?.message || "Assignment submitted for review successfully",
      };
    }

    return { success: false, message: "Unknown action" };
  } catch (error) {
    console.error("Failed to process action:", error);
    console.error("Error response:", {
      status: error.response?.status,
      data: error.response?.data,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        data: error.config?.data
      }
    });

    if (error.response?.data?.message) {
      return {
        success: false,
        message: error.response.data.message,
      };
    }

    return {
      success: false,
      message: "Failed to complete action. Please try again.",
    };
  }
}
