import { request } from './apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { NotificationItem } from '../types';
import { MOCK_NOTIFICATIONS } from '../api/mockData';

export const notificationService = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    try {
      return await request<NotificationItem[]>(API_ENDPOINTS.NOTIFICATIONS.LIST);
    } catch (error) {
      return MOCK_NOTIFICATIONS;
    }
  },

  markAsRead: async (id: string): Promise<void> => {
    try {
      await request(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id), { method: 'PUT' });
    } catch (error) {
      const found = MOCK_NOTIFICATIONS.find((n) => n.id === id);
      if (found) found.isRead = true;
    }
  },

  markAllAsRead: async (): Promise<void> => {
    try {
      await request(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, { method: 'PUT' });
    } catch (error) {
      MOCK_NOTIFICATIONS.forEach((n) => (n.isRead = true));
    }
  },
};
