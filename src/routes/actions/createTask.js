import axiosInstance from "@/services/api";

export async function createTaskAction({ request }) {
  const formData = await request.formData();

  try {
    // FormData is already in the correct format for multipart/form-data
    const response = await axiosInstance.post("/tasks", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      success: true,
      message: response.data.message || "Task created successfully",
      task: response.data.data.task,
    };
  } catch (error) {
    console.error("Failed to create task:", error);

    // Handle validation errors
    if (error.response?.status === 422) {
      return {
        success: false,
        errors: error.response.data.errors || {},
      };
    }

    // Handle authorization errors
    if (error.response?.status === 403) {
      return {
        success: false,
        errors: { general: ["You don't have permission to create tasks"] },
      };
    }

    // Generic error
    return {
      success: false,
      errors: { general: ["Failed to create task. Please try again."] },
    };
  }
}
