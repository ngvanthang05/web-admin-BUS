// API Service — kết nối Backend ASP.NET
// Khi chạy local (DEV) thì trỏ thẳng tới somee, khi lên Vercel (PROD) thì dùng đường dẫn tương đối để Vercel Proxy xử lý
const BASE_URL = import.meta.env.DEV ? 'http://nvthang-bus-api.somee.com' : '';

function getToken(): string | null {
  return localStorage.getItem('admin_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const fullUrl = `${BASE_URL}${path}`;
  const method = options.method || 'GET';
  console.log(`[API] ${method} ${fullUrl}`);
  const res = await fetch(fullUrl, { ...options, headers });
  console.log(`[API] ${method} ${fullUrl} → ${res.status}`);

  if (res.status === 401) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    // Đọc raw text trước để log debug
    const rawText = await res.text().catch(() => '');
    console.error(`[API] ${method} ${fullUrl} FAILED ${res.status}:`, rawText);

    let msg = `HTTP ${res.status}`;
    try {
      const d = JSON.parse(rawText);
      if (d.errors && typeof d.errors === 'object') {
        // ASP.NET validation errors: { title, errors: { Field: ["msg"] } }
        const details = Object.entries(d.errors)
          .map(([f, msgs]) => `${f}: ${(msgs as string[]).join(', ')}`)
          .join(' | ');
        msg = details || d.title || d.message || rawText;
      } else if (typeof d === 'string') {
        msg = d;
      } else {
        msg = d.title || d.message || d.error || d.detail || JSON.stringify(d);
      }
    } catch {
      // Body không phải JSON, dùng raw text
      if (rawText) msg = rawText.substring(0, 200);
    }
    throw new Error(msg);
  }

  if (res.status === 204) return {} as T;
  // Một số endpoint trả 200 với body rỗng (ví dụ DELETE)
  const text = await res.text();
  if (!text) return {} as T;
  try { return JSON.parse(text); } catch { return {} as T; }
}

// ===== AUTH =====
export const authApi = {
  login: (username: string, password: string) =>
    request<{ token: string; role: string; userId: number; username: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
};

// ===== DASHBOARD =====
export const adminApi = {
  getDashboard: () => request<any>('/api/admin/dashboard'),
  getSystemStats: () => request<any>('/api/admin/system/stats'),
  getRevenueReport: (from: string, to: string) =>
    request<any>(`/api/admin/reports/revenue?from=${from}&to=${to}`),
  getTripReport: (from: string, to: string) =>
    request<any>(`/api/admin/reports/trips?from=${from}&to=${to}`),

  // Staff
  getStaff: () => request<any[]>('/api/admin/staff'),
  getStaffById: (id: number) => request<any>(`/api/admin/staff/${id}`),
  createStaff: (data: any) => request<any>('/api/admin/staff', { method: 'POST', body: JSON.stringify(data) }),
  updateStaff: (id: number, data: any) => request<any>(`/api/admin/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStaff: (id: number) => request<any>(`/api/admin/staff/${id}`, { method: 'DELETE' }),

  // Drivers
  getDrivers: () => request<any[]>('/api/admin/drivers'),
  createDriver: (data: any) => request<any>('/api/admin/drivers', { method: 'POST', body: JSON.stringify(data) }),
  updateDriver: (id: number, data: any) => request<any>(`/api/admin/drivers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDriver: (id: number) => request<any>(`/api/admin/drivers/${id}`, { method: 'DELETE' }),

  // Users
  getUsers: () => request<any[]>('/api/admin/users'),
  createUser: (data: { username: string; email: string; password: string; role: string }) =>
    request<any>('/api/Users', { method: 'POST', body: JSON.stringify(data) }),
  deleteUser: (id: number) => request<any>(`/api/admin/users/${id}`, { method: 'DELETE' }),
  changeUserRole: (id: number, role: string) =>
    request<any>(`/api/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify(role) }),
  toggleUserActive: (id: number) =>
    request<any>(`/api/admin/users/${id}/toggle-active`, { method: 'PUT' }),
  resetPassword: (id: number, newPassword: string) =>
    request<any>(`/api/admin/users/${id}/reset-password`, { method: 'PUT', body: JSON.stringify(newPassword) }),
};

// ===== BUS ROUTES =====
export const routeApi = {
  getAll: () => request<any[]>('/api/BusRoutes'),
  getById: (id: number) => request<any>(`/api/BusRoutes/${id}`),
  create: (data: any) => request<any>('/api/BusRoutes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/api/BusRoutes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<any>(`/api/BusRoutes/${id}`, { method: 'DELETE' }),
};
// alias
export const routesApi = routeApi;

// ===== VEHICLES =====
export const vehicleApi = {
  getAll: () => request<any[]>('/api/Vehicles'),
  getById: (id: number) => request<any>(`/api/Vehicles/${id}`),
  create: (data: any) => request<any>('/api/Vehicles', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/api/Vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<any>(`/api/Vehicles/${id}`, { method: 'DELETE' }),
};
// alias
export const vehiclesApi = vehicleApi;

// ===== TRIPS =====
export const tripApi = {
  getAll: () => request<any[]>('/api/Trips'),
  getById: (id: number) => request<any>(`/api/Trips/${id}`),
  create: (data: any) => request<any>('/api/Trips', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/api/Trips/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  cancel: (id: number) => request<any>(`/api/Trips/${id}`, { method: 'DELETE' }),
  getSeats: (id: number) => request<any[]>(`/api/Trips/${id}/seats`),
};
// alias
export const tripsApi = tripApi;

// ===== CUSTOMERS =====
export const customerApi = {
  getAll: (page = 1, pageSize = 20, search = '') =>
    request<any>(`/api/customers?page=${page}&pageSize=${pageSize}&search=${search}`),
};

// ===== BOOKINGS / TICKETS =====
export const bookingApi = {
  getAll: () => request<any[]>('/api/bookings'),
  getById: (id: number) => request<any>(`/api/bookings/${id}`),
};
export const ticketApi = bookingApi;

// ===== PAYMENTS =====
export const paymentApi = {
  getAll: () => request<any[]>('/api/payments'),
  getStats: () => request<any>('/api/payments/stats'),
  markPaid: (id: number) => request<any>(`/api/payments/${id}/mark-paid`, { method: 'PUT' }),
  refund: (id: number) => request<any>(`/api/payments/${id}/refund`, { method: 'PUT' }),
};