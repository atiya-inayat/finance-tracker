// lib/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // 👈 change to your backend port
});

// Automatically attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
