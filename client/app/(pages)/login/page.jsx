"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ✅ not next/router
import { API_URL } from "@/app/lib/api";

// This is the authentication logic that was previously in a separate file.

export const login = async (email, plainTextPassword) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      plainTextPassword,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data || "Login failed!");
    } else if (error.request) {
      throw new Error(
        "No response from server. Please check your network connection."
      );
    } else {
      throw new Error("Error during login. Please try again.");
    }
  }
};

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");
    try {
      const response = await login(data.email, data.plainTextPassword);

      if (response && response.token) {
        localStorage.setItem("authToken", response.token);
        setMessage("Login successful!");
        // You can add a redirect to the dashboard here.
      } else {
        setMessage("Login failed! No token received.");
      }
      router.push("/"); // ✅ goes to root page.js
    } catch (error) {
      console.error("Login error:", error);
      setMessage(error.message || "Login failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Login
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="flex flex-col">
            <label
              className="text-gray-700 text-sm font-semibold mb-1"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              className="px-4 py-2 text-black border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label
              className="text-gray-700 text-sm font-semibold mb-1"
              htmlFor="plainTextPassword"
            >
              Password
            </label>
            <input
              type="password"
              id="plainTextPassword"
              placeholder="Password"
              className="px-4 py-2 text-black border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              {...register("plainTextPassword", {
                required: "Password is required",
              })}
            />
            {errors.plainTextPassword && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.plainTextPassword.message}
              </p>
            )}
          </div>

          {message && (
            <div
              className={`px-4 py-3 rounded relative text-center ${
                message.includes("success")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <span className="block">{message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div>
          <p className="mt-4 text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
