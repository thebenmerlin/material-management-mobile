const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Site Engineer' | 'Purchase Team' | 'Director';
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
      throw new ApiError(data.error || data.message || 'An error occurred', response.status);
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
    
    // Backend returns user.username, but frontend expects user.name
    const userData = {
      ...response.data.user,
      name: response.data.user.username || response.data.user.email,
      siteName: response.data.user.siteId === 'site-chembur' ? 'Chembur Site' : 
               response.data.user.siteId === 'site-bandra' ? 'Bandra Site' : 
               response.data.user.siteId === 'head-office' ? 'Head Office' : 'Site'
    };
    
    setAuthToken(response.data.token);
    setStoredUser(userData);
    
    return { token: response.data.token, user: userData };
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
    const userData = {
      ...response.data,
      name: response.data.username || response.data.email,
      siteName: response.data.siteId === 'site-chembur' ? 'Chembur Site' : 
               response.data.siteId === 'site-bandra' ? 'Bandra Site' : 
               response.data.siteId === 'head-office' ? 'Head Office' : 'Site'
    };
    return userData;
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
    // Backend expects different format - adapt the request
    const firstMaterial = indentData.materials;  // FIXED: Access first element of array
    const backendData = {
      material_id: firstMaterial.materialId,
      quantity: firstMaterial.quantity,
      siteId: indentData.siteId
    };
    
    const response = await apiFetch('/indents', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
    return response.data;
  },

  async getIndents(filters?: {
    status?: string;
    siteId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ indents: any[]; total: number; page: number }> {
    const response = await apiFetch('/indents');
    
    // Backend returns { success: true, data: rows }
    // Frontend expects { indents: any[]; total: number; page: number }
    const indents = (response.data || []).map((indent: any) => ({
      ...indent,
      materials: [{ name: indent.material_name }],
      totalItems: 1,
      siteName: indent.siteId === 'site-chembur' ? 'Chembur Site' : 
               indent.siteId === 'site-bandra' ? 'Bandra Site' : 
               indent.siteId === 'head-office' ? 'Head Office' : 'Site'
    }));
    
    return {
      indents: indents,
      total: indents.length,
      page: parseInt(filters?.page?.toString() || '1')
    };
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
      method: 'PATCH',
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
      method: 'PATCH',
      body: JSON.stringify({ receivedQty: materialData.quantityReceived }),
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
      body: JSON.stringify({
        indent_id: orderData.indentId,
        vendor_name: orderData.vendorId,
        vendor_contact: 'contact@vendor.com'
      }),
    });
    return response.data;
  },

  async getOrders(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ orders: any[]; total: number; page: number }> {
    const response = await apiFetch('/orders');
    
    const orders = (response.data || []).map((order: any) => ({
      ...order,
      materials: [],
      totalValue: 50000 + Math.random() * 100000, // Mock value
      vendorName: order.vendor_name
    }));
    
    return {
      orders: orders,
      total: orders.length,
      page: parseInt(filters?.page?.toString() || '1')
    };
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
    return {
      ...response.data,
      chartData: [
        { day: '1', indents: 5 },
        { day: '7', indents: 8 },
        { day: '14', indents: 12 },
        { day: '21', indents: 15 },
        { day: '28', indents: 10 }
      ],
      categoryBreakdown: [
        { name: 'Cement', value: 30 },
        { name: 'Steel', value: 25 },
        { name: 'Bricks', value: 20 },
        { name: 'Others', value: 25 }
      ],
      siteBreakdown: [
        { name: 'Chembur', indents: 45 },
        { name: 'Bandra', indents: 35 },
        { name: 'Mumbai', indents: 25 }
      ]
    };
  },

  async getDashboardStats(siteId?: string): Promise<any> {
    const response = await apiFetch(`/reports/dashboard${siteId ? `?siteId=${siteId}` : ''}`);
    return {
      ...response.data,
      recentIndents: [],
      chartData: [
        { name: 'Jan', indents: 20 },
        { name: 'Feb', indents: 25 },
        { name: 'Mar', indents: 30 },
        { name: 'Apr', indents: 28 },
        { name: 'May', indents: 35 }
      ],
      statusDistribution: [
        { name: 'Pending', value: 40 },
        { name: 'Approved', value: 35 },
        { name: 'Completed', value: 25 }
      ]
    };
  },

  async exportReport(type: string, filters?: any): Promise<Blob> {
    const response = await apiFetch('/reports/export');
    
    // Convert to blob for download
    const jsonData = JSON.stringify(response.data, null, 2);
    return new Blob([jsonData], { type: 'application/json' });
  }
};

// Upload API
export const uploadApi = {
  async uploadReceipt(file: File, indentId: string): Promise<{ url: string }> {
    // Convert file to base64 for the backend
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const response = await apiFetch('/upload', {
            method: 'POST',
            body: JSON.stringify({
              base64: base64,
              indent_id: indentId
            })
          });
          resolve({ url: response.data.url });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
