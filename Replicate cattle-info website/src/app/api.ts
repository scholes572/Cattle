// Local API configuration
export const API_URL = 'https://cattle-zqth.onrender.com/api';

// Get auth token from localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

// API response type
export interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  message?: string;
  cattle?: T;
  records?: T[];
  activities?: T[];
}

// API request helper with auth token
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response.json() as Promise<ApiResponse<T>>;
}

// Cattle API
export const cattleApi = {
  getAll: () => apiRequest<unknown[]>('/cattle'),
  getById: (id: string) => apiRequest<unknown>(`/cattle/${id}`),
  create: (data: unknown) => apiRequest<unknown>('/cattle', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: unknown) => apiRequest<unknown>(`/cattle/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest<unknown>(`/cattle/${id}`, {
    method: 'DELETE',
  }),
};

// Milk API
export const milkApi = {
  getAll: () => apiRequest<unknown[]>('/milk'),
  getByCattleId: (cattleId: string) => apiRequest<unknown[]>(`/milk/cattle/${cattleId}`),
  create: (data: unknown) => apiRequest<unknown>('/milk', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest<unknown>(`/milk/${id}`, {
    method: 'DELETE',
  }),
};

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    fetch(`${API_URL.replace('/api', '')}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then((r) => r.json()),
};

// Activity API
export const activityApi = {
  getAll: () => apiRequest<unknown[]>('/activities'),
  clear: () =>
    fetch(`${API_URL}/activities`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    }).then((r) => r.json()),
};
