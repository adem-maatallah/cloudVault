const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      headers,
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// CloudVault API
export const api = {
  // Health check
  healthCheck: () => apiCall('/api/health'),

  // Auth APIs
  signUp: (userData) => apiCall('/api/auth/signup', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => apiCall('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => apiCall('/api/auth/me'),

  // User APIs
  getUsers: () => apiCall('/api/users'),
  getUserById: (id) => apiCall(`/api/users/${id}`),
  getUserProfile: (id) => apiCall(`/api/users/${id}/profile`),
  createUser: (userData) => apiCall('/api/users', { method: 'POST', body: JSON.stringify(userData) }),
  updateUser: (id, userData) => apiCall(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) }),
  deleteUser: (id) => apiCall(`/api/users/${id}`, { method: 'DELETE' }),

  // Folder APIs
  getFolders: (userId, parentId) => {
    const params = new URLSearchParams({ userId: userId || 1 });
    if (parentId) params.append('parentId', parentId);
    return apiCall(`/api/folders?${params}`);
  },
  getFolderById: (id) => apiCall(`/api/folders/${id}`),
  createFolder: (folderData) => apiCall('/api/folders', { method: 'POST', body: JSON.stringify(folderData) }),
  updateFolder: (id, folderData) => apiCall(`/api/folders/${id}`, { method: 'PUT', body: JSON.stringify(folderData) }),
  deleteFolder: (id) => apiCall(`/api/folders/${id}`, { method: 'DELETE' }),

  // File APIs
  getFiles: (userId, folderId, favorite) => {
    const params = new URLSearchParams({ userId: userId || 1 });
    if (folderId) params.append('folderId', folderId);
    if (favorite) params.append('favorite', 'true');
    return apiCall(`/api/files?${params}`);
  },
  getFileById: (id) => apiCall(`/api/files/${id}`),
  searchFiles: (query, userId) => {
    const params = new URLSearchParams({ query, userId: userId || 1 });
    return apiCall(`/api/files/search?${params}`);
  },
  createFile: (fileData) => apiCall('/api/files', { method: 'POST', body: JSON.stringify(fileData) }),
  updateFile: (id, fileData) => apiCall(`/api/files/${id}`, { method: 'PUT', body: JSON.stringify(fileData) }),
  deleteFile: (id) => apiCall(`/api/files/${id}`, { method: 'DELETE' }),
  toggleFavorite: (id, isFavorite) => apiCall(`/api/files/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify({ isFavorite }) 
  }),

  // Share APIs
  getSharedWithMe: (userId) => {
    const params = new URLSearchParams({ userId: userId || 1 });
    return apiCall(`/api/shares/with-me?${params}`);
  },
  getSharedByMe: (userId) => {
    const params = new URLSearchParams({ userId: userId || 1 });
    return apiCall(`/api/shares/by-me?${params}`);
  },
  shareFile: (shareData) => apiCall('/api/shares', { method: 'POST', body: JSON.stringify(shareData) }),
  unshareFile: (id) => apiCall(`/api/shares/${id}`, { method: 'DELETE' }),

  // Activity & Stats APIs
  getActivity: (userId, limit) => {
    const params = new URLSearchParams({ userId: userId || 1 });
    if (limit) params.append('limit', limit);
    return apiCall(`/api/activity?${params}`);
  },
  getStats: (userId) => {
    const params = new URLSearchParams({ userId: userId || 1 });
    return apiCall(`/api/stats?${params}`);
  },
};

export default api;
