"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";

// This is the authentication logic that was previously in a separate file.
const API_URL = "http://localhost:3000/api/auth";

export const registerUser = async (name, email, plainTextPassword) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      name,
      email,
      plainTextPassword,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data || "Registration failed!");
    } else if (error.request) {
      throw new Error(
        "No response from server. Please check your network connection."
      );
    } else {
      throw new Error("Error during registration. Please try again.");
    }
  }
};

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");
    try {
      await registerUser(data.name, data.email, data.plainTextPassword);
      setMessage("Registration successful! You can now log in.");
    } catch (error) {
      console.error("Registration error:", error);
      setMessage(error.message || "Registration failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Register
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="flex flex-col">
            <label
              className="text-gray-700 text-sm font-semibold mb-1"
              htmlFor="name"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Name"
              className="px-4 py-2 text-black border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

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
              className="px-4 py-2  text-black border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
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
              className="px-4 py-2  text-black border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <div>
          <p className="mt-4 text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
