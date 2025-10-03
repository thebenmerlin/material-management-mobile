const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'SITE_ENGINEER' | 'PURCHASE_TEAM' | 'DIRECTOR';
  siteId?: string;
  siteName?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Token management
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setStoredUser = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Base fetch function with auth
const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getAuthToken();
  const url = `${API_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.message || 'An error occurred', response.status);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Network error', 500);
  }
};

// Auth API
export const authApi = {
  async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store token and user info
    setAuthToken(response.data.token);
    setStoredUser(response.data.user);

    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      removeAuthToken();
    }
  },

  async verifyToken(): Promise<User> {
    const response = await apiFetch('/auth/verify');
    return response.data;
  }
};

// Materials API
export const materialsApi = {
  async getAllMaterials(): Promise<any[]> {
    const response = await apiFetch('/materials');
    return response.data || [];
  },

  async searchMaterials(query: string): Promise<any[]> {
    const response = await apiFetch(`/materials/search?q=${encodeURIComponent(query)}`);
    return response.data || [];
  }
};

// Indents API
export const indentsApi = {
  async createIndent(indentData: {
    materials: Array<{
      materialId: string;
      quantity: number;
      specifications?: any;
    }>;
    siteId: string;
    description?: string;
  }): Promise<any> {
    const response = await apiFetch('/indents', {
      method: 'POST',
      body: JSON.stringify(indentData),
    });
    return response.data;
  },

  async getIndents(filters?: {
    status?: string;
    siteId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ indents: any[]; total: number; page: number }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }

    const response = await apiFetch(`/indents?${params.toString()}`);
    return response.data;
  },

  async getIndentById(id: string): Promise<any> {
    const response = await apiFetch(`/indents/${id}`);
    return response.data;
  },

  async updateIndentStatus(id: string, status: string, notes?: string): Promise<any> {
    const response = await apiFetch(`/indents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
    return response.data;
  },

  async approveIndent(id: string, approvalData: {
    approved: boolean;
    notes?: string;
  }): Promise<any> {
    const response = await apiFetch(`/indents/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(approvalData),
    });
    return response.data;
  },

  async markMaterialReceived(indentId: string, materialData: {
    materialId: string;
    quantityReceived: number;
    isDamaged: boolean;
    damageDescription?: string;
  }): Promise<any> {
    const response = await apiFetch(`/indents/${indentId}/receive`, {
      method: 'POST',
      body: JSON.stringify(materialData),
    });
    return response.data;
  }
};

// Orders API
export const ordersApi = {
  async createOrder(orderData: {
    indentId: string;
    vendorId: string;
    materials: Array<{
      materialId: string;
      quantity: number;
      unitPrice: number;
    }>;
  }): Promise<any> {
    const response = await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return response.data;
  },

  async getOrders(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ orders: any[]; total: number; page: number }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }

    const response = await apiFetch(`/orders?${params.toString()}`);
    return response.data;
  },

  async getOrderById(id: string): Promise<any> {
    const response = await apiFetch(`/orders/${id}`);
    return response.data;
  }
};

// Reports API
export const reportsApi = {
  async getMonthlyReport(month: number, year: number): Promise<any> {
    const response = await apiFetch(`/reports/monthly?month=${month}&year=${year}`);
    return response.data;
  },

  async getDashboardStats(siteId?: string): Promise<any> {
    const params = siteId ? `?siteId=${siteId}` : '';
    const response = await apiFetch(`/reports/dashboard${params}`);
    return response.data;
  },

  async exportReport(type: string, filters?: any): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }

    const token = getAuthToken();
    const url = `${API_URL}/reports/export/${type}?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new ApiError('Export failed', response.status);
    }

    return response.blob();
  }
};

// Upload API
export const uploadApi = {
  async uploadReceipt(file: File, indentId: string): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('indentId', indentId);

    const token = getAuthToken();

    const response = await fetch(`${API_URL}/upload/receipt`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.message || 'Upload failed', response.status);
    }

    return data.data;
  }
};

// Sites API
export const sitesApi = {
  async getAllSites(): Promise<any[]> {
    const response = await apiFetch('/sites');
    return response.data || [];
  }
};

export { ApiError };
export type { User, ApiResponse };
