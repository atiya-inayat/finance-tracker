// lib/axios.js
import axios from "axios";
import { API_BASE_URL } from "./constant";

const api = axios.create({
  baseURL: API_BASE_URL, // 👈 change to your backend port
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
