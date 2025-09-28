import axios from "axios";
import { API_BASE_URL } from "./constant";

/**
 * Registers a new user with the server.
 * @param {string} name - The user's name.
 * @param {string} email - The user's email.
 * @param {string} plainTextPassword - The user's password.
 * @returns {Promise<object>} - The response data from the server.
 */
export const register = async (name, email, plainTextPassword) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      name,
      email,
      plainTextPassword,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data || "Registration failed!");
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error(
        "No response from server. Please check your network connection."
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error("Error during registration. Please try again.");
    }
  }
};

/**
 * Logs in a user with the server.
 * @param {string} email - The user's email.
 * @param {string} plainTextPassword - The user's password.
 * @returns {Promise<object>} - The response data from the server.
 */
export const login = async (email, plainTextPassword) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      plainTextPassword,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data.message || "Login failed!");
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error(
        "No response from server. Please check your network connection."
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error("Error during login. Please try again.");
    }
  }
};
