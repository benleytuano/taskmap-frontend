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
        endpoint: `/my-tasks/${assignmentId}`
      });

      // Check if there are file attachments
      const attachments = formData.getAll("attachments[]");
      const hasFiles = attachments.some((file) => file instanceof File && file.size > 0);

      // Only send status if it actually changed
      const statusChanged = status !== originalStatus;

      let response;

      if (hasFiles) {
        // Use POST with multipart/form-data when sending files
        const updateData = new FormData();

        // Only include status if it changed
        if (statusChanged) {
          updateData.append("status", status);
        }

        if (progressNote) {
          updateData.append("progress_note", progressNote);
        }

        // Add attachments
        attachments.forEach((file) => {
          if (file instanceof File && file.size > 0) {
            updateData.append("attachments[]", file);
          }
        });

        response = await axiosInstance.post(
          `/my-tasks/${assignmentId}`,
          updateData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            params: {
              _method: "PUT",
            },
          }
        );
      } else {
        // Use PUT with JSON when no files
        const updateData = {};

        // Only include status if it changed
        if (statusChanged) {
          updateData.status = status;
        }

        if (progressNote) {
          updateData.progress_note = progressNote;
        }

        // Don't send empty updates
        if (Object.keys(updateData).length === 0) {
          return {
            success: false,
            message: "No changes to save",
          };
        }

        response = await axiosInstance.put(
          `/my-tasks/${assignmentId}`,
          updateData
        );
      }

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
