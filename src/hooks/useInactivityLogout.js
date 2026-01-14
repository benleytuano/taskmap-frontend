import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import axiosInstance from "@/services/api";

/**
 * Hook to automatically log out user after a period of inactivity
 * @param {number} timeout - Inactivity timeout in milliseconds
 */
export function useInactivityLogout(timeout = 30000) {
  const navigate = useNavigate();
  const timeoutIdRef = useRef(null);

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      navigate("/");
    }
  }, [navigate]);

  const resetTimer = useCallback(() => {
    // Clear existing timer
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    // Set new timer
    timeoutIdRef.current = setTimeout(() => {
      logout();
    }, timeout);
  }, [timeout, logout]);

  useEffect(() => {
    // Events that indicate user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Reset timer on any activity
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [resetTimer]);
}
