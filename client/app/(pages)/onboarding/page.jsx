"use client";

import { API_BASE_URL } from "@/app/lib/constant";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const router = useRouter();
  const handleContinueFree = async () => {
    await fetch(`${API_BASE_URL}/auth/complete-onboarding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    router.push("/dashboard");
  };

  const handleGoPremium = async () => {
    const token = localStorage.getItem("authToken"); // ✅ fetch token here

    const res = await fetch(
      "http://localhost:3005/api/stripe/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // const { url } = await res.json();
    // window.location.href = url; // redirect to Stripe checkout

    const data = await res.json();
    console.log("Checkout session response:", data);

    if (!data.url) {
      alert(`Stripe session failed: ${data.error || "No URL"}`);
      return;
    }
    window.location.href = data.url;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-2xl font-bold">Choose Your Plan</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* Free Plan */}
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold">Free Plan</h2>
          <ul>
            <li>✅ Basic dashboard</li>
            <li>✅ Track income & expenses</li>
            <li>❌ No reports & analytics</li>
          </ul>
          <button
            onClick={handleContinueFree}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Continue for Free
          </button>
        </div>

        {/* Premium Plan */}
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold">Premium Plan</h2>
          <ul>
            <li>✅ Everything in Free</li>
            <li>✅ Advanced reports & insights</li>
            <li>✅ Export data</li>
          </ul>
          <button
            onClick={handleGoPremium}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
          >
            Upgrade with Stripe
          </button>
        </div>
      </div>
    </div>
  );
}
