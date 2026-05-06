import api from './api';

export interface Notification {
  _id: string;
  type: string;
  subject: string;
  body: string;
  sentTo: string[];
  sentBy: { name: string };
  status: 'sent' | 'failed';
  createdAt: string;
}

export const notificationService = {
  getAll: async () => {
    const res = await api.get('/admin/notifications');
    return res.data.data as Notification[];
  },
  send: async (data: { subject: string; body: string; type: string; recipients: string | string[] }) => {
    const res = await api.post('/admin/notifications/send', data);
    return res.data.data;
  }
};
