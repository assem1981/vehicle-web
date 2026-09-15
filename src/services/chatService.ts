import { api } from './api';

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  bookingId?: number;
  content: string;
  isRead: boolean;
  timestamp: string;
}

export interface ConversationThread {
  id: string;
  otherUserId: number;
  otherUserName: string;
  otherUserAvatar: string;
  vehicleName?: string;
  bookingId?: number;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
}

export const chatService = {
  sendMessage: async (receiverId: number, content: string, bookingId?: number): Promise<Message> => {
    const response = await api.post('/api/messages', null, {
      params: { receiverId, content, bookingId }
    });
    return response.data;
  },

  getConversation: async (otherUserId: number): Promise<Message[]> => {
    const response = await api.get(`/api/messages/conversation/${otherUserId}`);
    return Array.isArray(response.data) ? response.data : [];
  },

  getMyThreads: async (): Promise<ConversationThread[]> => {
    const response = await api.get('/api/messages/threads');
    return Array.isArray(response.data) ? response.data : [];
  },

  submitReview: async (bookingId: number, vehicleId: number, rating: number, comment?: string) => {
    const response = await api.post('/api/reviews', null, {
      params: { bookingId, vehicleId, rating, comment }
    });
    return response.data;
  },

  submitVerification: async (driverLicenseNumber: string, identityDocumentUrl: string) => {
    const response = await api.post('/api/verification', null, {
      params: { driverLicenseNumber, identityDocumentUrl }
    });
    return response.data;
  },

  fileClaim: async (bookingId: number, description: string, estimatedAmount: number, evidenceImageUrls?: string) => {
    const response = await api.post('/api/claims', null, {
      params: { bookingId, description, estimatedAmount, evidenceImageUrls }
    });
    return response.data;
  },

  getAdminContact: async (): Promise<{ id: number; name: string; email: string }> => {
    try {
      const response = await api.get('/api/users/admin-contact');
      if (response.data && response.data.id) {
        const u = response.data;
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'System Support Admin';
        return { id: u.id, name, email: u.email || 'admin@vehicle.com' };
      }
    } catch (err) {
      console.warn('Failed to fetch admin user from backend:', err);
    }
    return { id: 1, name: 'System Support Admin', email: 'admin@vehicle.com' };
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await api.get('/api/messages/unread-count');
      return response.data?.unreadCount || 0;
    } catch {
      return 0;
    }
  },

  markConversationAsRead: async (otherUserId: number): Promise<void> => {
    try {
      await api.post(`/api/messages/read/${otherUserId}`);
    } catch (err) {
      console.warn('Failed to mark conversation as read:', err);
    }
  },

  getLatestUnreadThread: async (): Promise<ConversationThread | null> => {
    try {
      const threads = await chatService.getMyThreads();
      if (threads && threads.length > 0) {
        const unreadThread = threads.find(t => t.unread);
        if (unreadThread) return unreadThread;
      }
    } catch {
      // fallback
    }
    return null;
  }
};
