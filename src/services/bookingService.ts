import { api } from './api';

export interface BookingRequest {
  vehicleId: number;
  startDate: string;
  endDate: string;
  promoCode?: string;
}

export interface Booking {
  id: number;
  vehicleId: number;
  userId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  promoCode?: string;
  createdAt: string;
}

export interface PaymentRequest {
  bookingId: number;
  amount: number;
  paymentMethod?: string;
}

export interface CheckRecordRequest {
  bookingId: number;
  type: 'CHECK_IN' | 'CHECK_OUT';
  odometer: number;
  fuelLevel: number;
  photoUrls?: string;
  notes?: string;
}

function ensureArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && Array.isArray((data as { content?: unknown }).content)) {
    return (data as { content: T[] }).content;
  }
  return [];
}

export const bookingService = {
  createBooking: async (data: BookingRequest): Promise<Booking> => {
    const response = await api.post('/api/bookings', data);
    return response.data;
  },

  getMyBookings: async (): Promise<Booking[]> => {
    const response = await api.get('/api/bookings/me');
    return ensureArray<Booking>(response.data);
  },

  getBookingById: async (id: number): Promise<Booking> => {
    const response = await api.get(`/api/bookings/${id}`);
    return response.data;
  },

  getBookingsByVehicle: async (vehicleId: number): Promise<Booking[]> => {
    const response = await api.get(`/api/bookings/vehicle/${vehicleId}`);
    return ensureArray<Booking>(response.data);
  },

  getHostBookings: async (): Promise<Booking[]> => {
    try {
      const response = await api.get('/api/bookings/host/me');
      return ensureArray<Booking>(response.data);
    } catch (err) {
      console.warn('Failed to fetch host bookings via /api/bookings/host/me:', err);
      const response = await api.get('/api/bookings/me');
      return ensureArray<Booking>(response.data);
    }
  },

  processPayment: async (data: PaymentRequest) => {
    const response = await api.post('/api/payments', data);
    return response.data;
  },

  submitCheckRecord: async (data: CheckRecordRequest) => {
    const response = await api.post('/api/check-in-out', null, { params: data });
    return response.data;
  },

  getCheckRecordsForBooking: async (bookingId: number) => {
    const response = await api.get(`/api/check-in-out/booking/${bookingId}`);
    return ensureArray(response.data);
  },

  updateBookingStatus: async (bookingId: number, status: string) => {
    const response = await api.patch(`/api/bookings/${bookingId}/status`, null, { params: { status } });
    return response.data;
  }
};
