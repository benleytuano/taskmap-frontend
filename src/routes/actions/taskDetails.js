import axiosInstance from "@/services/api";
import { redirect } from "react-router";

export async function taskDetailsAction({ request, params }) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const taskId = params.taskId;

  try {
    switch (intent) {
      // Task operations
      case "update-task": {
        // Build FormData for multipart request
        const updateData = new FormData();

        // Add text fields if present
        const title = formData.get("title");
        const description = formData.get("description");
        const deadline = formData.get("deadline");
        const priority = formData.get("priority");

        if (title) updateData.append("title", title);
        if (description !== null) updateData.append("description", description);
        if (deadline) updateData.append("deadline", deadline);
        if (priority) updateData.append("priority", priority);

        // Add assigned users
        const assignedTo = formData.getAll("assigned_to[]");
        assignedTo.forEach((userId) => {
          updateData.append("assigned_to[]", userId);
        });

        // Add watchers
        const watchers = formData.getAll("watchers[]");
        watchers.forEach((userId) => {
          updateData.append("watchers[]", userId);
        });

        // Add new attachments
        const attachments = formData.getAll("attachments[]");
        attachments.forEach((file) => {
          if (file instanceof File && file.size > 0) {
            updateData.append("attachments[]", file);
          }
        });

        // Add attachments to remove
        const removeAttachments = formData.getAll("remove_attachments[]");
        removeAttachments.forEach((id) => {
          updateData.append("remove_attachments[]", id);
        });

        const response = await axiosInstance.post(
          `/tasks/${taskId}`,
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

        return {
          success: true,
          intent: "update-task",
          message: response.data.message || "Task updated successfully",
          task: response.data.data?.task,
        };
      }

      case "delete-task": {
        await axiosInstance.delete(`/tasks/${taskId}`);
        return redirect("/dashboard");
      }

      // Watcher operations
      case "add-watcher": {
        const userId = formData.get("user_id");
        const response = await axiosInstance.post(`/tasks/${taskId}/watchers`, {
          user_id: parseInt(userId),
        });
        return {
          success: true,
          message: response.data.message || "Watcher added successfully",
        };
      }

      case "remove-watcher": {
        const userId = formData.get("user_id");
        const response = await axiosInstance.delete(
          `/tasks/${taskId}/watchers/${userId}`
        );
        return {
          success: true,
          message: response.data.message || "Watcher removed successfully",
        };
      }

      // Attachment operations
      case "add-attachment": {
        const file = formData.get("file");
        const uploadData = new FormData();
        uploadData.append("file", file);

        const response = await axiosInstance.post(
          `/tasks/${taskId}/attachments`,
          uploadData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return {
          success: true,
          message: response.data.message || "Attachment uploaded successfully",
        };
      }

      case "remove-attachment": {
        const attachmentId = formData.get("attachment_id");
        const response = await axiosInstance.delete(
          `/tasks/${taskId}/attachments/${attachmentId}`
        );
        return {
          success: true,
          message: response.data.message || "Attachment deleted successfully",
        };
      }

      // Assignment operations
      case "add-assignment": {
        const userId = formData.get("user_id");
        const response = await axiosInstance.post(
          `/tasks/${taskId}/assignments`,
          {
            user_id: parseInt(userId),
          }
        );
        return {
          success: true,
          message: response.data.message || "Assignment added successfully",
        };
      }

      case "remove-assignment": {
        const assignmentId = formData.get("assignment_id");
        const response = await axiosInstance.delete(
          `/tasks/${taskId}/assignments/${assignmentId}`
        );
        return {
          success: true,
          message: response.data.message || "Assignment removed successfully",
        };
      }

      case "approve-assignment": {
        const assignmentId = formData.get("assignment_id");
        const response = await axiosInstance.put(
          `/tasks/${taskId}/assignments/${assignmentId}/approve`
        );
        return {
          success: true,
          message: response.data.message || "Assignment approved successfully",
        };
      }

      case "request-revision": {
        const assignmentId = formData.get("assignment_id");
        const assignerRemarks = formData.get("assigner_remarks");
        const response = await axiosInstance.put(
          `/tasks/${taskId}/assignments/${assignmentId}/revision`,
          {
            assigner_remarks: assignerRemarks,
          }
        );
        return {
          success: true,
          message: response.data.message || "Revision requested successfully",
        };
      }

      default:
        return {
          success: false,
          message: "Invalid action",
        };
    }
  } catch (error) {
    console.error(`Failed to ${intent}:`, error);

    // Handle specific error responses
    if (error.response?.status === 400) {
      return {
        success: false,
        message: error.response.data.message || "Operation failed",
      };
    }

    if (error.response?.status === 404) {
      return {
        success: false,
        message: error.response.data.message || "Resource not found",
      };
    }

    if (error.response?.status === 422) {
      return {
        success: false,
        message: "Validation error",
        errors: error.response.data.errors || {},
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "An error occurred. Please try again.",
    };
  }
}
