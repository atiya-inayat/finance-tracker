import axios from "axios";
import { API_BASE_URL } from "./constant";

// Create a single Axios instance with a base URL
const API = axios.create({
  baseURL: API_BASE_URL,
});

// Use an interceptor to automatically add the Authorization header
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const postRequest = async (endpoint, data) => {
  try {
    const response = await API.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error("API request failed:", error.response?.data || error.message);
    throw error;
  }
};

// Transaction API
export const getTransactions = async () => {
  try {
    const response = await API.get("/transactions");
    return response.data;
  } catch (error) {
    console.error("API request failed:", error.response?.data || error.message);
    throw error;
  }
};

export const createTransaction = async (data) => {
  try {
    const response = await API.post("/transactions", data);
    return response.data;
  } catch (error) {
    console.error("API request failed:", error.response?.data || error.message);
    throw error;
  }
};

export const updateTransaction = async (id, data) => {
  try {
    const response = await API.put(`/transactions/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("API request failed:", error.response?.data || error.message);
    throw error;
  }
};

// export const updateTransaction = async (id, data) => {
//   const res = await fetch(`/transactions/${id}`, {
//     method: "PUT",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data),
//   });
//   if (!res.ok) throw new Error("Failed to update transaction");
//   return res.json();
// };

export const deleteTransaction = async (id) => {
  try {
    const response = await API.delete(`/transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error("API request failed:", error.response?.data || error.message);
    throw error;
  }
};

// Dashboard API
export const getDashboardData = async () => {
  try {
    const response = await API.get(`/dashboard`);
    return response.data;
  } catch (error) {
    console.error("API request failed:", error.response?.data || error.message);
    throw error;
  }
};

// Budget API - A new function to fetch budgets
export const getBudgets = async () => {
  try {
    const response = await API.get("/budgets");
    return response.data;
  } catch (error) {
    console.error("API request failed:", error.response?.data || error.message);
    throw error;
  }
};
