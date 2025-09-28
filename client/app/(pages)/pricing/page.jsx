"use client";

import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";

// ✅ Load Stripe with your *publishable key* (NOT secret key)
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const PricingPage = () => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // make request to backend
      const { data } = await axios.post(
        "http://localhost:3005/api/stripe/create-checkout-session",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      const stripe = await stripePromise;

      // redirect to stripe checkout page
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
      if (error) {
        console.error("Stripe checkout error:", error);
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Pricing</h1>
      <div className="border p-6 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold">Premium Plan</h2>
        <p className="mt-2 text-gray-600">$5 / month</p>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Redirecting..." : "Go Premium"}
        </button>
      </div>
    </div>
  );
};

export default PricingPage;
