"use client";

import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/app/lib/constant";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get token from URL query (?token=abc123)
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        newPassword,
      });
      setMessage(response.data.message);

      // Redirect to login after successful reset
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      setMessage("Error resetting password. Try again.");
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetPassword;
