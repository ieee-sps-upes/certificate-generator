import axios from 'axios';

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export const certApi = {
  sendOtp: (name, email, sapId) => api.post('/send-otp', { name, email, sap_id: sapId }),
  generateCertificate: (email, otp, event_name, team_id) =>
    api.post('/generate-certificate', { email, otp, event_name, team_id }),
};

export default api;