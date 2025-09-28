"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/app/lib/constant";

export default function SuccessPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // ✅ Call your backend to fetch updated user details
        const { data } = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        setUser(data.user);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        ✅ Payment Successful!
      </h1>
      <p className="text-lg mb-6">
        Your account has been upgraded to <strong>Premium</strong>.
      </p>

      {user && (
        <div className="border p-4 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-700">{user.email}</p>
          <p className="mt-2">
            Subscription Status:{" "}
            <span className="font-bold text-blue-600">
              {user.subscriptionStatus}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
