import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

let walletAddressGetter: () => string | null = () => localStorage.getItem('algorand_wallet_address');

export const setWalletAddressGetter = (getter: () => string | null) => {
  walletAddressGetter = getter;
};

// Auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const walletAddress = walletAddressGetter()?.trim();
  if (walletAddress) {
    config.headers['x-wallet-address'] = walletAddress;

    if ((config.method || 'get').toLowerCase() === 'get') {
      config.params = { ...(config.params || {}), walletAddress };
    } else if (config.data && Object.prototype.toString.call(config.data) === '[object Object]') {
      config.data = { walletAddress, ...config.data };
    }
  }

  return config;
});

// Error handler
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    console.error('[API Error]', message);
    return Promise.reject(error);
  }
);

// Categories
export const getCategories = () => api.get('/categories').then(r => r.data);
export const createCategory = (data: { name: string; color?: string; icon?: string }) => api.post('/categories', data).then(r => r.data);
export const updateCategory = (id: string, data: { name: string; color?: string; icon?: string }) => api.put(`/categories/${id}`, data).then(r => r.data);
export const deleteCategory = (id: string) => api.delete(`/categories/${id}`).then(r => r.data);

// Users
export const searchUsers = (q: string) => api.get(`/users/search?q=${encodeURIComponent(q)}`).then(r => r.data);

// Groups
export const getGroups = () => api.get('/groups').then(r => r.data);
export const createGroup = (data: { name: string; description?: string; members: string[] }) => api.post('/groups', data).then(r => r.data);
export const getGroupDetail = (id: string) => api.get(`/groups/${id}`).then(r => r.data);
export const addGroupMembers = (groupId: string, userIds: string[]) => api.post(`/groups/${groupId}/members`, { userIds }).then(r => r.data);
export const removeGroupMember = (groupId: string, userId: string) => api.delete(`/groups/${groupId}/members/${userId}`).then(r => r.data);
export const addGroupExpense = (groupId: string, data: { amount: number; description: string; date?: string; categoryId?: string; splitType: string; participants: any[] }) => api.post(`/groups/${groupId}/expenses`, data).then(r => r.data);

// Transfers & Chat
export const sendTransfer = (data: { toUserId: string; amount: number; note?: string; categoryId?: string }) => api.post('/transfers/send', data).then(r => r.data);


// Analysis
export const getNetBalance = (params?: Record<string, string>) => api.get('/analysis/net-balance', { params }).then(r => r.data);
export const getCategoryBreakdown = (params?: Record<string, string>) => api.get('/analysis/category-breakdown', { params }).then(r => r.data);
export const getTrends = (params?: Record<string, string>) => api.get('/analysis/trends', { params }).then(r => r.data);
export const getTransactions = (params?: Record<string, string>) => api.get('/analysis/transactions', { params }).then(r => r.data);

// Activity
export const getActivityFeed = (params?: Record<string, string>) => api.get('/activity/feed', { params }).then(r => r.data);

// Events
export const getEvents = () => api.get('/events').then(r => r.data);
export const buyTicket = (eventId: string, buyerAddress?: string) =>
  api.post(`/events/${eventId}/tickets/buy`, buyerAddress ? { buyerAddress } : {}).then(r => r.data);
export const getMyTickets = () => api.get('/tickets/mine').then(r => r.data);

// Chats list


export default api;
