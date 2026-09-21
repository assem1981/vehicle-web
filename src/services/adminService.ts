import { api } from './api';

export interface AdminMetrics {
  totalGmvUSD: number;
  platformFeesUSD: number;
  activeUsersCount: number;
  activeHostsCount: number;
  totalVehiclesCount: number;
  pendingApprovalsCount: number;
  activeBookingsCount: number;
  openComplaintsCount: number;
}

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'SUSPENDED';
  joinedDate: string;
  tripsCount: number;
}

interface BackendUserProfile {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roles?: string[];
  active: boolean;
  hostApprovalStatus?: string;
  createdAt?: string;
}

export interface AdminHost {
  id: number;
  userId: number;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  fleetSize?: number;
  rating?: number;
  totalEarnings?: number;
  isSuperhost?: boolean;
  totalTripsCount?: number;
  status?: string;
}

interface BackendHostDto {
  id: number;
  userId: number;
  bio?: string;
  payoutAccountDetails?: string;
  averageRating?: number;
  totalTripsCount?: number;
  totalEarnings?: number;
  superHost?: boolean;
}

export interface AdminVehicleListing {
  id: number;
  hostId?: number;
  make: string;
  model: string;
  year: number;
  category: string;
  hostName: string;
  dailyRate: number;
  locationCity: string;
  status: 'PENDING_APPROVAL' | 'AVAILABLE' | 'DEACTIVATED' | 'IN_USE' | 'MAINTENANCE';
  vin: string;
  submittedAt?: string;
  imageUrl: string;
}

export interface AdminRefundRequest {
  id: string;
  bookingId: number;
  customerName: string;
  amountUSD: number;
  reason: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
}

export interface AdminPromoCode {
  id: string;
  code: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED';
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  targetEntity: string;
  ipAddress: string;
}

export interface HostApplication {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  hostApprovalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export const adminService = {
  getMetrics: async (): Promise<AdminMetrics> => {
    const response = await api.get('/api/analytics/summary');
    const d = response.data || {};
    return {
      totalGmvUSD: Number(d.totalRevenue || 0),
      platformFeesUSD: Number(d.totalRevenue || 0) * 0.15,
      activeUsersCount: Number(d.totalUsers || 0),
      activeHostsCount: Number(d.totalHosts || 0),
      totalVehiclesCount: Number(d.totalVehicles || 0),
      pendingApprovalsCount: Number(d.pendingApprovalsCount || 0),
      activeBookingsCount: Number(d.totalBookings || 0),
      openComplaintsCount: 0,
    };
  },

  getUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get('/api/users');
    const data = Array.isArray(response.data) ? response.data : [];
    return data.map((u: BackendUserProfile) => {
      const roles = (u.roles || []).map(r => r.toUpperCase());
      const role = roles.includes('ROLE_ADMIN')
        ? 'ADMIN'
        : roles.includes('ROLE_HOST')
          ? 'HOST'
          : roles.includes('ROLE_USER') || roles.includes('ROLE_RENTER')
            ? 'RENTER'
            : 'RENTER';
      return {
        id: u.id,
        fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
        email: u.email,
        role,
        status: u.active ? 'ACTIVE' : 'SUSPENDED',
        joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—',
        tripsCount: 0
      };
    });
  },

  getHosts: async (): Promise<AdminHost[]> => {
    const [hostsRes, usersRes, vehiclesRes] = await Promise.all([
      api.get('/api/hosts').catch(() => ({ data: [] })),
      api.get('/api/users').catch(() => ({ data: [] })),
      api.get('/api/vehicles/admin/all').catch(() => ({ data: [] }))
    ]);
    const hosts: BackendHostDto[] = Array.isArray(hostsRes.data) ? hostsRes.data : [];
    const users: BackendUserProfile[] = Array.isArray(usersRes.data) ? usersRes.data : [];
    const vehicles: AdminVehicleListing[] = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : [];

    // Compute fleet size per host user ID
    const fleetSizeByHostId = new Map<number, number>();
    vehicles.forEach(v => {
      if (v.hostId) {
        fleetSizeByHostId.set(v.hostId, (fleetSizeByHostId.get(v.hostId) || 0) + 1);
      }
    });

    const hostProfileByUserId = new Map(hosts.map(h => [h.userId, h]));
    const processedUserIds = new Set<number>();
    const result: AdminHost[] = [];

    // Include all registered users who have the HOST role
    const hostUsers = users.filter(u => {
      const roles = (u.roles || []).map(r => r.toUpperCase());
      return roles.includes('ROLE_HOST') || roles.includes('HOST');
    });

    hostUsers.forEach(u => {
      processedUserIds.add(u.id);
      const profile = hostProfileByUserId.get(u.id);
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;
      const count = fleetSizeByHostId.get(u.id) || 0;

      result.push({
        id: profile ? profile.id : u.id,
        userId: u.id,
        name: fullName,
        email: u.email,
        bio: profile?.bio || 'Verified Host Partner',
        fleetSize: count,
        rating: profile?.averageRating ?? 4.9,
        totalEarnings: profile?.totalEarnings ? Number(profile.totalEarnings) : 0,
        isSuperhost: profile?.superHost ?? true,
        totalTripsCount: profile?.totalTripsCount ?? 0,
        status: 'VERIFIED'
      });
    });

    // Also include any profiles from hostRepository that might not be in hostUsers list
    hosts.forEach(h => {
      if (!processedUserIds.has(h.userId)) {
        const count = fleetSizeByHostId.get(h.userId) || 0;
        result.push({
          id: h.id,
          userId: h.userId,
          name: `Host #${h.userId}`,
          email: undefined,
          bio: h.bio,
          fleetSize: count,
          rating: h.averageRating ?? 4.8,
          totalEarnings: h.totalEarnings ? Number(h.totalEarnings) : 0,
          isSuperhost: h.superHost ?? false,
          totalTripsCount: h.totalTripsCount ?? 0,
          status: 'VERIFIED'
        });
      }
    });

    return result;
  },

  toggleUserStatus: async (userId: number, status: 'ACTIVE' | 'SUSPENDED') => {
    await api.post('/api/admin/users/status', { targetUserId: userId, active: status === 'ACTIVE' });
  },

  getVehicles: async (status?: string): Promise<AdminVehicleListing[]> => {
    if (status && status !== 'ALL') {
      const response = await api.get('/api/vehicles', { params: { status } });
      return Array.isArray(response.data) ? response.data : [];
    }
    const response = await api.get('/api/vehicles/admin/all');
    return Array.isArray(response.data) ? response.data : [];
  },

  getVehiclesByHost: async (hostId: number): Promise<AdminVehicleListing[]> => {
    const response = await api.get(`/api/vehicles/host/${hostId}`);
    return Array.isArray(response.data) ? response.data : [];
  },

  getPendingVehicles: async (): Promise<AdminVehicleListing[]> => {
    const response = await api.get('/api/vehicles', { params: { status: 'PENDING_APPROVAL' } });
    return Array.isArray(response.data) ? response.data : [];
  },

  updateVehicleApproval: async (vehicleId: number, status: 'APPROVED' | 'REJECTED') => {
    const response = await api.patch(`/api/vehicles/${vehicleId}/status`, null, {
      params: { status: status === 'APPROVED' ? 'AVAILABLE' : 'DEACTIVATED' }
    });
    return response.data;
  },

  updateVehicleDetails: async (vehicleId: number, data: Partial<AdminVehicleListing>): Promise<AdminVehicleListing> => {
    const response = await api.put(`/api/vehicles/${vehicleId}`, data);
    return response.data;
  },

  deleteVehicle: async (vehicleId: number): Promise<void> => {
    await api.delete(`/api/vehicles/${vehicleId}`);
  },

  getRefundRequests: async (): Promise<AdminRefundRequest[]> => {
    const response = await api.get('/api/payments/refund-requests');
    return Array.isArray(response.data) ? response.data : [];
  },

  processRefund: async (refundId: string, status: 'APPROVED' | 'DENIED') => {
    if (status === 'APPROVED') {
      await api.post(`/api/payments/${refundId}/refund`);
    }
  },

  getPromoCodes: async (): Promise<AdminPromoCode[]> => {
    const response = await api.get('/api/promotions');
    return Array.isArray(response.data) ? response.data : [];
  },

  createPromoCode: async (promo: Omit<AdminPromoCode, 'id' | 'usedCount' | 'status'>) => {
    const response = await api.post('/api/promotions', null, {
      params: {
        code: promo.code,
        discountPercentage: promo.discountPercent,
        expirationDate: promo.expiresAt,
        usageLimit: promo.maxUses
      }
    });
    return response.data;
  },

  getAuditLogs: async (): Promise<AdminAuditLog[]> => {
    const response = await api.get('/api/audit-logs');
    return Array.isArray(response.data) ? response.data : [];
  },

  getHostApplications: async (): Promise<HostApplication[]> => {
    const response = await api.get('/api/admin/host-applications');
    return Array.isArray(response.data) ? response.data : [];
  },

  approveHostApplication: async (userId: number): Promise<void> => {
    await api.post(`/api/admin/host-applications/${userId}/approve`);
  },

  rejectHostApplication: async (userId: number): Promise<void> => {
    await api.post(`/api/admin/host-applications/${userId}/reject`);
  },

  getAllBookings: async () => {
    const response = await api.get('/api/bookings/admin/all').catch(() => api.get('/api/bookings/host/me'));
    return Array.isArray(response.data) ? response.data : [];
  },

  updateBookingStatus: async (bookingId: number, status: string) => {
    const response = await api.patch(`/api/bookings/${bookingId}/status`, null, {
      params: { status }
    });
    return response.data;
  }
};
