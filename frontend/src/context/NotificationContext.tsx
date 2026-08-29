import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { notificationsApi } from '../api/notifications';
import { Notification } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { info } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const prevUnreadCount = useRef<number>(0);
  const isInitialLoad = useRef<boolean>(true);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const res = await notificationsApi.list();
      const currentUnread = res.data.unread_count;
      const notifs = res.data.notifications;

      // Check if new unread notification arrived
      if (!isInitialLoad.current && currentUnread > prevUnreadCount.current && notifs.length > 0) {
        const latest = notifs[0];
        if (!latest.is_read) {
          info(`🔔 ${latest.title}: ${latest.message}`);
        }
      }

      setNotifications(notifs);
      setUnreadCount(currentUnread);
      prevUnreadCount.current = currentUnread;
      isInitialLoad.current = false;
    } catch (err) {
      console.error('Failed to fetch notifications in context:', err);
    }
  }, [isAuthenticated, info]);

  // Initial fetch and auto-polling every 5 seconds
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      fetchNotifications().finally(() => setIsLoading(false));

      const interval = setInterval(() => {
        fetchNotifications();
      }, 5000);

      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      isInitialLoad.current = true;
      prevUnreadCount.current = 0;
    }
  }, [isAuthenticated, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      prevUnreadCount.current = Math.max(0, prevUnreadCount.current - 1);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      prevUnreadCount.current = 0;
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const target = notifications.find((n) => n.id === id);
      await notificationsApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
        prevUnreadCount.current = Math.max(0, prevUnreadCount.current - 1);
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await notificationsApi.clearAll();
      setNotifications([]);
      setUnreadCount(0);
      prevUnreadCount.current = 0;
    } catch (err) {
      console.error('Failed to clear all notifications:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
