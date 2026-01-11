import axiosInstance from "@/services/api";

export async function userTaskDetailsAction({ request, params }) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    if (intent === "update-assignment") {
      const assignmentId = formData.get("assignment_id");
      const status = formData.get("status");
      const progressNote = formData.get("progress_note");

      // Check if there are file attachments
      const attachments = formData.getAll("attachments[]");
      const hasFiles = attachments.some((file) => file instanceof File && file.size > 0);

      let response;

      if (hasFiles) {
        // Use POST with multipart/form-data when sending files
        const updateData = new FormData();
        updateData.append("status", status);
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
        const updateData = {
          status: status,
        };

        if (progressNote) {
          updateData.progress_note = progressNote;
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
