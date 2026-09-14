import { api } from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  roles?: string[];
}

export interface SocialLoginPayload {
  token: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface UserSession {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  roles: string[];
}

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/** Extract a list of role strings from various backend payload shapes. */
function normalizeRoles(rawRoles: unknown): string[] {
  if (!rawRoles) return [];
  const arr = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
  return arr.map((r) => {
    if (typeof r === 'string') return r;
    if (typeof r === 'object' && r !== null) {
      const roleObj = r as { name?: string; authority?: string };
      return roleObj?.name || roleObj?.authority || String(r);
    }
    return String(r);
  }).filter(Boolean);
}

/** Notify all listeners (e.g. Navbar) that auth state changed */
function notifyAuthChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-change'));
  }
}

export const authService = {
  getAuthConfig: async (): Promise<{ googleClientId: string }> => {
    try {
      const response = await api.get('/api/auth/config');
      return response.data || { googleClientId: '' };
    } catch {
      return { googleClientId: '' };
    }
  },

  login: async (data: LoginPayload) => {
    const response = await api.post('/api/auth/login', data);
    const token = response.data.accessToken || response.data.token;

    if (!token) {
      return response.data;
    }

    localStorage.setItem('token', token);

    const payload = parseJwt(token);
    const tokenRoles = payload?.roles ? normalizeRoles(payload.roles) : [];

    const userSession: UserSession = {
      id: response.data.user?.id || Number(payload?.sub) || 0,
      firstName: response.data.user?.firstName || '',
      lastName: response.data.user?.lastName || '',
      email: response.data.user?.email || payload?.email || data.email,
      roles: tokenRoles
    };

    localStorage.setItem('user', JSON.stringify(userSession));

    // Sync full profile from backend for latest user details and roles.
    try {
      const profile = await authService.getCurrentUser();
      if (profile) {
        localStorage.setItem('user', JSON.stringify(profile));
      }
    } catch {
      // Keep JWT-derived session if profile fetch fails.
    }

    notifyAuthChange();
    return { ...response.data, accessToken: token, user: userSession, roles: userSession.roles };
  },

  register: async (data: RegisterPayload) => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  /**
   * Check if a login error indicates the account is pending host approval.
   * Spring Security blocks login for inactive accounts (isEnabled=false).
   */
  isHostApprovalPending: (error: { response?: { status?: number; data?: { message?: string } | string }; message?: string }): boolean => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const message = ((typeof data === 'object' && data !== null ? data?.message : data) || error?.message || '').toLowerCase();
    return (
      (status === 401 || status === 403) &&
      (message.includes('disabled') || message.includes('pending') || message.includes('not active') || message.includes('approval'))
    );
  },

  googleLogin: async (data: SocialLoginPayload) => {
    const response = await api.post('/api/auth/oauth2/google', data);
    const token = response.data.accessToken || response.data.token;

    if (token) {
      localStorage.setItem('token', token);

      const payload = parseJwt(token);
      const tokenRoles = payload?.roles ? normalizeRoles(payload.roles) : ['ROLE_USER'];

      const userSession: UserSession = {
        id: response.data.user?.id || Number(payload?.sub) || 0,
        firstName: response.data.user?.firstName || data.firstName || 'User',
        lastName: response.data.user?.lastName || data.lastName || '',
        email: response.data.user?.email || payload?.email || data.email,
        roles: tokenRoles
      };

      localStorage.setItem('user', JSON.stringify(userSession));

      try {
        const profile = await authService.getCurrentUser();
        if (profile) {
          localStorage.setItem('user', JSON.stringify(profile));
        }
      } catch {
        // Retain initial session if profile query fails
      }

      notifyAuthChange();
    }
    return response.data;
  },

  appleLogin: async (data: SocialLoginPayload) => {
    const response = await api.post('/api/auth/oauth2/apple', data);
    const token = response.data.accessToken || response.data.token;

    if (token) {
      localStorage.setItem('token', token);

      const payload = parseJwt(token);
      const tokenRoles = payload?.roles ? normalizeRoles(payload.roles) : ['ROLE_USER'];

      const userSession: UserSession = {
        id: response.data.user?.id || Number(payload?.sub) || 0,
        firstName: response.data.user?.firstName || data.firstName || 'User',
        lastName: response.data.user?.lastName || data.lastName || '',
        email: response.data.user?.email || payload?.email || data.email,
        roles: tokenRoles
      };

      localStorage.setItem('user', JSON.stringify(userSession));

      try {
        const profile = await authService.getCurrentUser();
        if (profile) {
          localStorage.setItem('user', JSON.stringify(profile));
        }
      } catch {
        // Retain initial session if profile query fails
      }

      notifyAuthChange();
    }
    return response.data;
  },

  getCurrentUser: async (): Promise<UserSession | null> => {
    const response = await api.get('/api/users/me');
    if (!response.data) return null;

    const profileRoles = normalizeRoles(response.data.roles);
    const tokenRoles = authService.getRolesFromToken();
    const storedUser = authService.getUserFromStorage();
    const existingRoles = storedUser?.roles || tokenRoles;

    const mergedRoles = Array.from(new Set([...existingRoles, ...profileRoles]));
    const finalRoles = mergedRoles.length > 0 ? mergedRoles : ['ROLE_USER'];

    const userSession: UserSession = {
      id: response.data.id,
      firstName: response.data.firstName || 'User',
      lastName: response.data.lastName || '',
      email: response.data.email,
      phoneNumber: response.data.phoneNumber,
      roles: finalRoles
    };

    localStorage.setItem('user', JSON.stringify(userSession));
    return userSession;
  },

  updateProfile: async (data: { firstName?: string; lastName?: string; phoneNumber?: string }): Promise<UserSession> => {
    const params = new URLSearchParams();
    if (data.firstName) params.append('firstName', data.firstName);
    if (data.lastName) params.append('lastName', data.lastName);
    if (data.phoneNumber) params.append('phoneNumber', data.phoneNumber);

    const response = await api.put(`/api/users/me?${params.toString()}`);
    const userSession = {
      id: response.data.id,
      firstName: response.data.firstName || 'User',
      lastName: response.data.lastName || '',
      email: response.data.email,
      phoneNumber: response.data.phoneNumber,
      roles: normalizeRoles(response.data.roles)
    };
    localStorage.setItem('user', JSON.stringify(userSession));
    return userSession;
  },

  getUserFromStorage: (): UserSession | null => {
    if (typeof window === 'undefined') return null;
    const str = localStorage.getItem('user');
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  },

  hasRole: (user: UserSession | null, role: string): boolean => {
    if (!user || !user.roles) return false;
    const normalizedRole = role.toUpperCase();
    return user.roles.some(r => {
      const norm = r.toUpperCase();
      return norm === normalizedRole || norm === `ROLE_${normalizedRole}` || `ROLE_${norm}` === normalizedRole;
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      notifyAuthChange();
    }
  },

  getRolesFromToken: (): string[] => {
    if (typeof window === 'undefined') return [];
    const token = localStorage.getItem('token');
    if (!token) return [];
    const payload = parseJwt(token);
    return payload?.roles ? normalizeRoles(payload.roles) : [];
  }
};
