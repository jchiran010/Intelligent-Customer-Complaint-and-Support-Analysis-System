export type NotificationType = 'leave:submitted' | 'leave:approved' | 'leave:rejected' | 'attendance:updated' | 'payroll:updated' | 'notification:new' | 'system:alert';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}
