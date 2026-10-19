import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const api = axios.create({ baseURL: apiBaseUrl });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("crop-dashboard-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const reportsApi = {
  create: (payload) => {
    const formData = new FormData();
    formData.append("cropType", payload.cropType);
    payload.symptoms.forEach((symptom) => formData.append("symptoms", symptom));
    if (payload.image) formData.append("image", payload.image);
    return api.post("/reports", formData).then((response) => response.data);
  },
  list: () => api.get("/reports").then((response) => response.data),
  diseases: (cropType) => api.get("/reports/diseases", { params: { cropType } }).then((response) => response.data),
  stats: () => api.get("/reports/stats").then((response) => response.data),
  predictImage: (payload) => {
    const formData = new FormData();
    formData.append("cropType", payload.cropType);
    if (payload.image) formData.append("image", payload.image);
    return api.post("/reports/predict-image", formData).then((response) => response.data);
  },
};

export const assetUrl = (url) => url?.startsWith("http")
  ? url
  : `${apiBaseUrl.replace(/\/api\/?$/, "")}${url}`;

export const authApi = {
  login: (payload) => api.post("/auth/login", payload).then((response) => response.data),
  register: (payload) => api.post("/auth/register", payload).then((response) => response.data),
};

export default api;
