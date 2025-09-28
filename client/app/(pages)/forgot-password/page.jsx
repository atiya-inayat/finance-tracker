"use client";

import React, { useState } from "react";
import axios from "axios"; // Or use the auth.js service
import { API_BASE_URL } from "@/app/lib/constant";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Call the backend endpoint
      const response = await axios.post(
        `${API_BASE_URL}/auth/forgot-password`,
        {
          email,
        }
      );
      setMessage(response.data.message);
      // This message is always the generic one for security!
    } catch (error) {
      // In a real app, handle network errors here
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>
      {message && <p style={{ color: "green" }}>{message}</p>}
    </div>
  );
}

export default ForgotPassword;
