import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Organiser Events
export const getOrganizerEvents = () => api.get('/organiser/events').then(r => r.data);
export const createEvent = (data: {
  eventName: string;
  description?: string;
  date: string;
  location?: string;
  capacity: number;
  ticketPrice: number;
  image?: string;
}) => api.post('/organiser/events/create', data).then(r => r.data);

export const getEventDetails = (eventId: string) => api.get(`/organiser/events/${eventId}`).then(r => r.data);
export const updateEvent = (eventId: string, data: any) => api.put(`/organiser/events/${eventId}`, data).then(r => r.data);
export const deleteEvent = (eventId: string) => api.delete(`/organiser/events/${eventId}`).then(r => r.data);

// Event ticket holders
export const getEventTicketHolders = (eventId: string) => api.get(`/organiser/events/${eventId}/holders`).then(r => r.data);
export const checkInTicket = (eventId: string, ticketId: string) => api.post(`/organiser/events/${eventId}/checkin/${ticketId}`).then(r => r.data);

// Event analytics
export const getEventAnalytics = (eventId: string) => api.get(`/organiser/events/${eventId}/analytics`).then(r => r.data);

export default api;
