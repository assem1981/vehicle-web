import { api } from './api';

export interface Vehicle {
  id: number;
  hostId: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  category: string;
  transmission: string;
  seatingCapacity: number;
  fuelType: string;
  dailyRate: number;
  locationCity: string;
  latitude?: number;
  longitude?: number;
  status: string;
  imageUrl?: string;
  interiorImageUrl?: string;
  hostName?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  rating?: number;
  trips?: number;
}

export interface SearchQuery {
  city?: string;
  startDate?: string;
  endDate?: string;
  maxPrice?: number;
  category?: string;
}

function ensureArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && Array.isArray((data as { content?: unknown }).content)) {
    return (data as { content: T[] }).content;
  }
  return [];
}

export const vehicleService = {
  getAllVehicles: async (): Promise<Vehicle[]> => {
    const response = await api.get('/api/vehicles');
    return ensureArray<Vehicle>(response.data);
  },

  getVehicleById: async (id: number): Promise<Vehicle> => {
    const response = await api.get(`/api/vehicles/${id}`);
    return response.data;
  },

  searchVehicles: async (query: SearchQuery): Promise<Vehicle[]> => {
    const cleanQuery: Record<string, unknown> = {};
    if (query.city) cleanQuery.city = query.city;
    if (query.startDate) cleanQuery.startDate = query.startDate;
    if (query.endDate) cleanQuery.endDate = query.endDate;
    if (query.maxPrice) cleanQuery.maxPrice = query.maxPrice;
    if (query.category) cleanQuery.category = query.category;
    const response = await api.post('/api/search', cleanQuery);
    return ensureArray<Vehicle>(response.data);
  },

  calculatePrice: async (vehicleId: number, startDate: string, endDate: string): Promise<number> => {
    const response = await api.get('/api/pricing/calculate', {
      params: { vehicleId, startDate, endDate }
    });
    return response.data;
  },

  createVehicle: async (vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await api.post('/api/vehicles', vehicleData);
    return response.data;
  }
};
