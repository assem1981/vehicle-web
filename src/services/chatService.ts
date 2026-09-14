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

export const chatService = {
  sendMessage: async (receiverId: number, content: string, bookingId?: number): Promise<Message> => {
    const response = await api.post('/api/messages', null, {
      params: { receiverId, content, bookingId }
    });
    return response.data;
  },

  getConversation: async (otherUserId: number): Promise<Message[]> => {
    const response = await api.get(`/api/messages/conversation/${otherUserId}`);
    return response.data;
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
  }
};
