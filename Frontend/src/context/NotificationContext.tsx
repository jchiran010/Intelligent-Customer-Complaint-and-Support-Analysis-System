import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NotificationItem } from '../types';
import { notificationService } from '../services/notificationService';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

export interface ToastAlert {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  toasts: ToastAlert[];
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addToast: (type: ToastAlert['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { subscribe } = useSocket();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const addToast = useCallback((type: ToastAlert['type'], title: string, message: string) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto remove toast after 4.5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Socket.IO event listeners for real-time notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubs: (() => void)[] = [];

    const handleLeaveApproved = (data: any) => {
      const newNotif: NotificationItem = {
        id: 'notif-' + Date.now(),
        userId: user?.id || '',
        type: 'leave:approved',
        title: 'Leave Approved',
        message: `Leave request for ${data.leaveType || 'vacation'} (${data.startDate} - ${data.endDate}) was approved!`,
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      addToast('success', 'Leave Approved', newNotif.message);
    };

    const handleLeaveRejected = (data: any) => {
      const newNotif: NotificationItem = {
        id: 'notif-' + Date.now(),
        userId: user?.id || '',
        type: 'leave:rejected',
        title: 'Leave Rejected',
        message: `Leave request (${data.startDate} - ${data.endDate}) was rejected. Reason: ${data.adminComments || 'See details'}`,
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      addToast('error', 'Leave Rejected', newNotif.message);
    };

    const handleLeaveSubmitted = (data: any) => {
      if (user?.role === 'HR' || user?.role === 'ADMIN') {
        const newNotif: NotificationItem = {
          id: 'notif-' + Date.now(),
          userId: user?.id || '',
          type: 'leave:submitted',
          title: 'New Leave Request',
          message: `${data.employeeName} submitted a ${data.leaveType} request.`,
          timestamp: new Date().toISOString(),
          isRead: false,
        };
        setNotifications((prev) => [newNotif, ...prev]);
        addToast('info', 'New Leave Request', newNotif.message);
      }
    };

    const handleAttendanceUpdated = (data: any) => {
      const newNotif: NotificationItem = {
        id: 'notif-' + Date.now(),
        userId: user?.id || '',
        type: 'attendance:updated',
        title: 'Attendance Updated',
        message: `Clock status updated to ${data.status} for ${data.employeeName}.`,
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      addToast('info', 'Attendance Event', newNotif.message);
    };

    const handlePayrollUpdated = (data: any) => {
      const newNotif: NotificationItem = {
        id: 'notif-' + Date.now(),
        userId: user?.id || '',
        type: 'payroll:updated',
        title: 'Payroll Updated',
        message: `Salary structure updated for ${data.employeeName}. Net Salary: $${data.salaryStructure?.netSalary || data.lastPayoutAmount}.`,
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      addToast('success', 'Payroll Event', newNotif.message);
    };

    unsubs.push(subscribe('leave:approved', handleLeaveApproved));
    unsubs.push(subscribe('leave:rejected', handleLeaveRejected));
    unsubs.push(subscribe('leave:submitted', handleLeaveSubmitted));
    unsubs.push(subscribe('attendance:updated', handleAttendanceUpdated));
    unsubs.push(subscribe('payroll:updated', handlePayrollUpdated));

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [isAuthenticated, user, subscribe, addToast]);

  const markAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        isLoading,
        markAsRead,
        markAllAsRead,
        addToast,
        removeToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
