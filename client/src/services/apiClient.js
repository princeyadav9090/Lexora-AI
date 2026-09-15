const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('lexora_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchClient = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers
  };

  const res = await fetch(url, config);
  const data = await res.json();

  if (!res.ok) {
    const errorMsg = data.error?.message || data.message || 'An error occurred during request execution.';
    throw new Error(errorMsg);
  }

  // Handle standard ApiResponse structure { success, data, message } or legacy response
  return data.data !== undefined ? data.data : data;
};
