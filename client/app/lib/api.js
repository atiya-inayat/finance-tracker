// // import axios from "axios";

// // const API_BASE_URL = "http://localhost:3000/api";

// // // auth api
// // export const postRequest = async (endpoint, data) => {
// //   try {
// //     const response = await axios.post(`${API_BASE_URL}${endpoint}`, data, {
// //       headers: {
// //         "Content-Type": "application/json",
// //       },
// //     });

// //     return response.data; // axios already parses JSON
// //   } catch (error) {
// //     console.error("API request failed:", error.response?.data || error.message);
// //     throw error;
// //   }
// // };

// // // transaction api
// // export const getTransactions = async () => {
// //   try {
// //     const response = await axios.get(`${API_BASE_URL}/transactions`, {
// //       headers: {
// //         "Content-Type": "application/json",
// //         Authorization: `Bearer ${localStorage.getItem("authToken")}`,
// //       },
// //     });

// //     return response.data; // axios already parses JSON
// //   } catch (error) {
// //     console.error("API request failed:", error.response?.data || error.message);
// //     throw error;
// //   }
// // };

// // // creating transaction api
// // export const createTransaction = async (data) => {
// //   try {
// //     const response = await axios.post(`${API_BASE_URL}/transactions`, data, {
// //       headers: {
// //         "Content-Type": "application/json",
// //         Authorization: `Bearer ${localStorage.getItem("authToken")}`,
// //       },
// //     });

// //     return response.data;
// //   } catch (error) {
// //     console.error("API request failed:", error.response?.data || error.message);
// //     throw error;
// //   }
// // };

// // *************************************************

// // api.js

// import axios from "axios";

// // Create a single Axios instance with a base URL
// const API = axios.create({
//   baseURL: "http://localhost:3000/api",
// });

// // Use an interceptor to automatically add the Authorization header
// // to every request made with this API instance.
// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("authToken");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Auth API - use a single function for all authenticated POST requests
// export const postRequest = async (endpoint, data) => {
//   try {
//     const response = await API.post(endpoint, data, {
//       // You can still add specific headers if needed, but the Authorization header is handled by the interceptor
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("API request failed:", error.response?.data || error.message);
//     throw error;
//   }
// };

// // Transaction API
// export const getTransactions = async () => {
//   try {
//     const response = await API.get("/transactions");
//     return response.data;
//   } catch (error) {
//     console.error("API request failed:", error.response?.data || error.message);
//     throw error;
//   }
// };

// // Creating a new transaction
// export const createTransaction = async (data) => {
//   try {
//     const response = await API.post("/transactions", data);
//     return response.data;
//   } catch (error) {
//     console.error("API request failed:", error.response?.data || error.message);
//     throw error;
//   }
// };

// // update transaction (use PUT or PATCH depending on your backend)
// export const updateTransaction = async (id, data) => {
//   try {
//     const response = await API.put(`/transactions/${id}`, data);
//     return response.data;
//   } catch (error) {
//     console.error("API request failed:", error.response?.data || error.message);
//     throw error;
//   }
// };

// // delete transaction
// export const deleteTransaction = async (id) => {
//   try {
//     const response = await API.delete(`/transactions/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error("API request failed:", error.response?.data || error.message);
//     throw error;
//   }
// };

// // get summary of transactions
// export const getDashboardData = async () => {
//   try {
//     const response = await API.get(`/dashboard`);
//     return response.data;
//   } catch (error) {
//     console.error("API request failed:", error.response?.data || error.message);
//     throw error;
//   }
// };

// frontend/app/lib/api.js

import axios from "axios";

export const API_URL = "http://localhost:3005/api";

// Create a single Axios instance with a base URL
const API = axios.create({
  baseURL: API_URL,
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
