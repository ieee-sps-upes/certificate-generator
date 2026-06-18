import axios from 'axios';

const api = axios.create({
  baseURL: '/api',  // Relative path — handled by reverse proxy in production, Vite proxy in dev
});

export const certApi = {
  sendOtp: (name, email, sapId) => api.post('/send-otp', { name, email, sap_id: sapId }),
  generateCertificate: (email, otp, event_name, team_id) =>
    api.post('/generate-certificate', { email, otp, event_name, team_id }),
};

export default api;