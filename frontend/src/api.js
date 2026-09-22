import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("crop-dashboard-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const reportsApi = {
  create: (payload) => api.post("/reports", payload).then((response) => response.data),
  list: () => api.get("/reports").then((response) => response.data),
  stats: () => api.get("/reports/stats").then((response) => response.data),
};

export const authApi = {
  login: (payload) => api.post("/auth/login", payload).then((response) => response.data),
  register: (payload) => api.post("/auth/register", payload).then((response) => response.data),
};

export default api;
