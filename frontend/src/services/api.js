import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('meditrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If sending FormData, remove Content-Type so Axios/browser automatically appends boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('meditrack_token');
      localStorage.removeItem('meditrack_user');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const prescriptionAPI = {
  upload: (formData) => api.post('/prescriptions/upload', formData),
  getAll: (patientId = null) => api.get(patientId ? `/prescriptions?patient_id=${patientId}` : '/prescriptions'),
  getById: (id) => api.get(`/prescriptions/${id}`),
  verify: (id, verifiedMedicines) => api.put(`/prescriptions/${id}/verify`, { verified_medicines: verifiedMedicines }),
  retry: (id) => api.post(`/prescriptions/${id}/retry`)
};

export const doctorAPI = {
  getDashboard: () => api.get('/doctor/dashboard'),
  getPatients: () => api.get('/doctor/patients'),
  getPatientClinicalRecord: (patientId) => api.get(`/doctor/patients/${patientId}`),
  issuePrescription: (data) => api.post('/doctor/prescriptions', data),
  grantAccess: (data) => api.post('/doctor/access/grant', data),
  getProfile: () => api.get('/doctor/profile'),
  updateProfile: (data) => api.put('/doctor/profile', data)
};

export const medicationAPI = {
  getAll: () => api.get('/medications'),
  create: (data) => api.post('/medications', data),
  update: (id, data) => api.put(`/medications/${id}`, data),
  delete: (id) => api.delete(`/medications/${id}`),
  markTaken: (id) => api.post(`/medications/${id}/taken`),
  markMissed: (id) => api.post(`/medications/${id}/missed`),
  markSnooze: (id) => api.post(`/medications/${id}/snooze`),
  getLogs: () => api.get('/medications/logs')
};

export const reminderAPI = {
  getAll: () => api.get('/reminders'),
  create: (data) => api.post('/reminders', data),
  update: (id, data) => api.put(`/reminders/${id}`, data)
};

export const appointmentAPI = {
  getAll: () => api.get('/appointments'),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`)
};

export const medicineAPI = {
  search: (query) => api.get(`/medicines/search?q=${encodeURIComponent(query || '')}`),
  getDetails: (id, lat = 13.0827, lon = 80.2707) => api.get(`/medicines/${id}?lat=${lat}&lon=${lon}`)
};

export const pharmacyAPI = {
  getNearby: (lat = 13.0827, lon = 80.2707) => api.get(`/pharmacies/nearby?lat=${lat}&lon=${lon}`),
  compare: (medicine, lat = 13.0827, lon = 80.2707) => api.get(`/pharmacies/compare?medicine=${encodeURIComponent(medicine || '')}&lat=${lat}&lon=${lon}`),
  getDetails: (id, lat = 13.0827, lon = 80.2707) => api.get(`/pharmacies/${id}?lat=${lat}&lon=${lon}`),
  getInventory: (id) => api.get(`/pharmacies/${id}/inventory`),
  addInventory: (pharmacyId, data) => api.post(`/pharmacies/${pharmacyId}/inventory`, data),
  updateInventory: (inventoryId, data) => api.put(`/pharmacies/inventory/${inventoryId}`, data)
};

export const cartAPI = {
  get: () => api.get('/cart'),
  add: (item) => api.post('/cart', item),
  update: (itemId, data) => api.put(`/cart/${itemId}`, data),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete('/cart')
};

export const orderAPI = {
  place: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status })
};

export const deliveryAPI = {
  assign: (data) => api.post('/delivery/assign', data),
  getAll: () => api.get('/delivery'),
  getById: (id) => api.get(`/delivery/${id}`),
  updateStatus: (id, status) => api.put(`/delivery/${id}/status`, { status })
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  verifyDoctor: (id, isVerified) => api.put(`/admin/doctors/${id}/verify`, { is_verified: isVerified }),
  verifyPharmacy: (id, isVerified) => api.put(`/admin/pharmacies/${id}/verify`, { is_verified: isVerified }),
  getPharmacies: () => api.get('/admin/pharmacies'),
  createPharmacy: (data) => api.post('/admin/pharmacies', data),
  getMedicines: () => api.get('/admin/medicines'),
  createMedicine: (data) => api.post('/admin/medicines', data),
  getInventory: () => api.get('/admin/inventory'),
  getOrders: () => api.get('/admin/orders'),
  getDeliveryPersonnel: () => api.get('/admin/delivery-personnel'),
  getReports: () => api.get('/admin/reports'),
  getAuditLogs: () => api.get('/admin/audit-logs'),
  getOcrHealth: () => api.get('/admin/ocr-health')
};

export const dashboardAPI = {
  getUser: () => api.get('/dashboard/user'),
  getDoctor: () => api.get('/dashboard/doctor'),
  getPharmacy: () => api.get('/dashboard/pharmacy'),
  getDelivery: () => api.get('/dashboard/delivery'),
  getAdmin: () => api.get('/dashboard/admin')
};

export default api;
