import { useState, useEffect } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const {
    unreadCount,
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllRead,
  } = useNotifications(60000); // Poll every 60 seconds

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.is_read) {
        await markAsRead(notification.id);
      }

      // Navigate based on notification type
      const taskId = notification.data?.task_id;
      const assignmentId = notification.data?.assignment_id;

      if (assignmentId) {
        navigate(`/dashboard/my-tasks/${assignmentId}`);
      } else if (taskId) {
        navigate(`/dashboard/tasks/${taskId}`);
      }

      // Close dropdown
      setOpen(false);
    } catch (error) {
      console.error("Failed to handle notification click:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllRead();
    } catch (error) {
      console.error("Failed to clear all:", error);
    }
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getNotificationIcon = (type) => {
    // You can customize icons based on notification type
    return "📋";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-lg">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="h-8 text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-8 text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-gray-50 transition-colors relative group",
                      !notification.is_read && "bg-blue-50 hover:bg-blue-100"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type.value)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.created_at_human}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleDelete(e, notification.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                            aria-label="Delete notification"
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                        {!notification.is_read && (
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
