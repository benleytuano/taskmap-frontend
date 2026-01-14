import { useState, useEffect, useCallback } from "react";
import { notificationService } from "@/services/notificationService";

/**
 * Hook to manage notifications with automatic polling
 * @param {number} pollInterval - Polling interval in milliseconds (default: 60000 = 1 minute)
 */
export function useNotifications(pollInterval = 60000) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
      setError(err);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotifications(page);
      setNotifications(data.notifications);
      return data;
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (id) => {
    try {
      await notificationService.markAsRead(id);
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      // Decrease unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
      throw err;
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      throw err;
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id) => {
    try {
      await notificationService.deleteNotification(id);
      // Update local state
      const notif = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      // Decrease unread count if notification was unread
      if (notif && !notif.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
      throw err;
    }
  }, [notifications]);

  // Clear all read notifications
  const clearAllRead = useCallback(async () => {
    try {
      await notificationService.clearAllRead();
      // Remove read notifications from local state
      setNotifications((prev) => prev.filter((notif) => !notif.is_read));
    } catch (err) {
      console.error("Failed to clear all:", err);
      throw err;
    }
  }, []);

  // Poll for unread count
  useEffect(() => {
    // Initial fetch
    fetchUnreadCount();

    // Set up polling
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [fetchUnreadCount, pollInterval]);

  return {
    unreadCount,
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllRead,
    refreshUnreadCount: fetchUnreadCount,
  };
}
