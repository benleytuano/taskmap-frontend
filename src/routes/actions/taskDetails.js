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
        const title = formData.get("title");
        const description = formData.get("description");
        const deadline = formData.get("deadline");
        const priority = formData.get("priority");

        const response = await axiosInstance.put(
          `/tasks/${taskId}`,
          {
            title,
            description,
            deadline,
            priority,
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
        const userIds = formData.getAll("user_ids[]").map((id) => parseInt(id));
        const response = await axiosInstance.post(`/tasks/${taskId}/watchers`, {
          user_ids: userIds,
        });
        return {
          success: true,
          message: response.data.message || "Watchers added successfully",
          data: response.data.data,
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
        const files = formData.getAll("files[]");
        const uploadData = new FormData();

        // Append all files with the files[] parameter name
        files.forEach(file => {
          uploadData.append("files[]", file);
        });

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
          message: response.data.message || "Attachments uploaded successfully",
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
        const userIds = formData.getAll("user_ids[]").map((id) => parseInt(id));
        const response = await axiosInstance.post(
          `/tasks/${taskId}/assignments`,
          {
            user_ids: userIds,
          }
        );
        return {
          success: true,
          message: response.data.message || "Assignments added successfully",
          data: response.data.data,
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
