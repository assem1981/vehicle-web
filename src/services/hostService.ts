import { api } from './api';

export interface VehicleDocument {
  id: string;
  type: 'REGISTRATION' | 'INSURANCE' | 'INSPECTION';
  fileName: string;
  fileUrl: string;
  status: 'PENDING' | 'APPROVED' | 'EXPIRED';
  uploadedAt: string;
}

export interface DeliveryConfig {
  offersDelivery: boolean;
  deliveryRadiusMiles: number;
  deliveryFeeUSD: number;
  airportDelivery: boolean;
  airportFeeUSD: number;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: number;
  vehicleName: string;
  serviceType: 'Oil Change' | 'Tire Rotation' | 'Brake Inspection' | 'General Repair';
  date: string;
  odometerMiles: number;
  costUSD: number;
  provider: string;
  notes?: string;
}

export interface DamageReport {
  id: string;
  bookingId: number;
  vehicleId: number;
  vehicleName: string;
  renterName: string;
  reportedAt: string;
  severity: 'MINOR' | 'MODERATE' | 'SEVERE';
  status: 'UNDER_REVIEW' | 'CLAIM_APPROVED' | 'REJECTED' | 'SETTLED';
  description: string;
  photoUrls: string[];
  estimatedCostUSD: number;
}

export interface HostEarningsSummary {
  totalEarningsUSD: number;
  monthlyEarningsUSD: number;
  pendingPayoutUSD: number;
  completedBookingsCount: number;
  payoutHistory: {
    id: string;
    date: string;
    amountUSD: number;
    status: 'PAID' | 'PROCESSING';
    bankAccount: string;
  }[];
}

export const hostService = {
  getVerificationStatus: async () => {
    const response = await api.get('/api/verification/me');
    return response.data;
  },

  submitVerification: async (data: { driverLicenseNumber: string; identityDocumentUrl: string }) => {
    const response = await api.post('/api/verification', null, {
      params: data
    });
    return response.data;
  },

  getHostVehicles: async () => {
    const response = await api.get('/api/vehicles/host/me');
    return Array.isArray(response.data) ? response.data : [];
  },

  getDocuments: async (vehicleId?: number) => {
    const response = await api.get(`/api/vehicles/${vehicleId ?? 'me'}/documents`);
    return Array.isArray(response.data) ? response.data : [];
  },

  getMaintenanceRecords: async () => {
    const response = await api.get('/api/vehicles/maintenance');
    return Array.isArray(response.data) ? response.data : [];
  },

  addMaintenanceRecord: async (record: Omit<MaintenanceRecord, 'id'>) => {
    const response = await api.post('/api/vehicles/maintenance', record);
    return response.data;
  },

  getDamageReports: async () => {
    const response = await api.get('/api/claims/me');
    return Array.isArray(response.data) ? response.data : [];
  },

  submitDamageReport: async (report: Omit<DamageReport, 'id' | 'reportedAt' | 'status'>) => {
    const response = await api.post('/api/claims', null, {
      params: {
        bookingId: report.bookingId,
        description: report.description,
        estimatedAmount: report.estimatedCostUSD,
        evidenceImageUrls: report.photoUrls?.join(',')
      }
    });
    return response.data;
  },

  getEarningsSummary: async (): Promise<HostEarningsSummary> => {
    const response = await api.get('/api/hosts/me/earnings');
    return response.data;
  }
};
