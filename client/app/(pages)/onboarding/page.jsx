"use client";

import { API_BASE_URL } from "@/app/lib/constant";
import { useRouter } from "next/navigation";

const plans = {
  free: [
    "✅ Add & manage transactions (income/expense tracking).",
    "✅ Categories (Food, Rent, Travel, etc.) – limited to e.g. 5 custom categories only.",
    "✅ Monthly summary (income vs expense).",
    " ✅ Manual goal setting (set a savings goal, but no smart suggestions).",
    "✅ Financial literacy tips (1 per day).",
    "✅ Export limited reports (e.g., last 30 days only).",
  ],
  paid: [
    "🚀 Unlimited transactions & custom categories.",
    "🚀 Advanced analytics (spending trends, graphs, predictive insights).",
    "🚀 Smart AI suggestions (“You could save $100 if you cut 20% from Food category”).",
    "🚀 Multiple budgets & goal tracking (vacation fund, emergency savings, etc.).",
    "🚀 Financial health score with personalized recommendations.",
    "🚀 Daily/weekly reports & export to Excel/CSV.",
    "🚀 Recurring transactions (like monthly rent, bills).",
    "🚀 Priority support + early access to new features.",
  ],
};

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
          <h2 className="text-xl font-semibold">Free Forever</h2>
          <h4 className=" font-semibold">Simple finance tracking</h4>
          <ul>
            {plans.free.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
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
          <h2 className="text-xl font-semibold">Premium – $5/mo</h2>
          <h3 className=" font-semibold">Smart finance, smarter you</h3>
          <ul>
            {plans.paid.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
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
