import axiosInstance from "./api";

/**
 * Notification Service
 * Handles all notification-related API calls
 */

export const notificationService = {
  /**
   * Get all notifications with pagination
   * @param {number} page - Page number
   * @returns {Promise} Notification list and pagination data
   */
  getNotifications: async (page = 1) => {
    const response = await axiosInstance.get(`/notifications?page=${page}`);
    return response.data.data;
  },

  /**
   * Get unread notification count
   * @returns {Promise} Unread count
   */
  getUnreadCount: async () => {
    const response = await axiosInstance.get("/notifications/unread-count");
    return response.data.data.unread_count;
  },

  /**
   * Mark a notification as read
   * @param {number} id - Notification ID
   * @returns {Promise} Updated notification
   */
  markAsRead: async (id) => {
    const response = await axiosInstance.put(`/notifications/${id}/read`);
    return response.data.data.notification;
  },

  /**
   * Mark all notifications as read
   * @returns {Promise} Count of marked notifications
   */
  markAllAsRead: async () => {
    const response = await axiosInstance.put("/notifications/mark-all-read");
    return response.data.data.marked_count;
  },

  /**
   * Delete a notification
   * @param {number} id - Notification ID
   * @returns {Promise} Success message
   */
  deleteNotification: async (id) => {
    const response = await axiosInstance.delete(`/notifications/${id}`);
    return response.data;
  },

  /**
   * Clear all read notifications
   * @returns {Promise} Count of deleted notifications
   */
  clearAllRead: async () => {
    const response = await axiosInstance.delete("/notifications/clear-all");
    return response.data.data.deleted_count;
  },
};
