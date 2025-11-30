// "use client";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { API_BASE_URL } from "@/app/lib/constant";
// import Charts from "../../components/dashboard/Charts";
// import BalanceCard from "@/app/components/dashboard/BalanceCard";
// import FloatingAIChat from "../aiChat/page";

// export default function DashboardPage() {
//   const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
//   const [categories, setCategories] = useState([]);
//   const [transactions, setTransactions] = useState([]);
//   const [subscriptionStatus, setSubscriptionStatus] = useState("free");
//   const [loading, setLoading] = useState(true);

//   const getToken = () => {
//     try {
//       return localStorage.getItem("authToken");
//     } catch {
//       return null;
//     }
//   };

//   useEffect(() => {
//     const fetchDashboard = async () => {
//       setLoading(true);
//       try {
//         const token = getToken();
//         if (!token) return;

//         // Dashboard summary
//         const dashRes = await axios.get(
//           `${API_BASE_URL}/transactions/dashboard-data`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );

//         if (dashRes.data?.dashboard) {
//           setSummary(dashRes.data.dashboard);
//           setSubscriptionStatus(
//             dashRes.data.dashboard.subscriptionStatus || "free"
//           );
//         }

//         if (dashRes.data?.categories) setCategories(dashRes.data.categories);

//         // Transactions
//         const txRes = await axios.get(`${API_BASE_URL}/transactions`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (txRes.data?.transactions) setTransactions(txRes.data.transactions);
//       } catch (err) {
//         console.error("Error fetching dashboard:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboard();
//   }, []);

//   const handleUpgrade = () => (window.location.href = "/pricing");

//   const handleManageSubscription = async () => {
//     try {
//       const token = getToken();
//       if (!token) return;
//       const res = await axios.post(
//         `${API_BASE_URL}/stripe/create-portal-session`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       if (res.data?.url) window.location.href = res.data.url;
//     } catch (err) {
//       console.error("Failed to open billing portal:", err);
//       alert("Failed to open billing portal.");
//     }
//   };

//   if (loading)
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         Loading dashboard...
//       </div>
//     );

//   const formatAmount = (amount) =>
//     Number(amount ?? 0).toLocaleString(undefined, {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });

//   const isNewUser =
//     transactions.length === 0 &&
//     categories.length === 0 &&
//     summary.income === 0 &&
//     summary.expense === 0 &&
//     summary.balance === 0;

//   return (
//     <div className="min-h-screen w-full bg-[#f3f4f6] px-6 py-6">
//       <div className="max-w-6xl mx-auto space-y-10">
//         <h1 className="text-3xl font-semibold tracking-tight text-gray-800">
//           Dashboard
//         </h1>

//         {isNewUser ? (
//           <div className="p-6 space-y-6 text-center bg-white border border-gray-200 shadow rounded-2xl">
//             <h2 className="text-2xl font-semibold text-gray-700">
//               Welcome to FinTrack!
//             </h2>
//             <p className="text-gray-600">
//               Looks like you’re just getting started. Add your first transaction
//               to see insights and charts here.
//             </p>
//             <button
//               onClick={() => (window.location.href = "/transactions")}
//               className="px-6 py-2 font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
//             >
//               Add Your First Transaction
//             </button>
//           </div>
//         ) : (
//           <>
//             {/* SUMMARY CARDS */}
//             <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
//               <BalanceCard
//                 income={summary.income}
//                 expense={summary.expense}
//                 balance={summary.balance}
//               />
//             </div>

//             {/* Chart + Subscription */}
//             <div className="flex flex-col gap-6 lg:flex-row">
//               <div className="flex-1 p-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
//                 <h2 className="mb-4 text-xl font-medium text-gray-700">
//                   Overview
//                 </h2>
//                 {categories.length > 0 ? (
//                   <Charts data={categories} />
//                 ) : (
//                   <p className="text-center text-gray-500">
//                     No categories or transactions to display.
//                   </p>
//                 )}
//               </div>

//               <div className="flex flex-col justify-between w-full p-6 bg-white border border-gray-200 shadow-sm lg:w-1/3 rounded-2xl">
//                 <h2 className="mb-2 text-lg font-semibold text-gray-800">
//                   {subscriptionStatus === "premium"
//                     ? "Premium Plan"
//                     : "Upgrade to Premium"}
//                 </h2>
//                 {subscriptionStatus === "premium" ? (
//                   <button
//                     onClick={handleManageSubscription}
//                     className="px-4 py-2 mt-4 font-medium text-white bg-green-600 rounded hover:bg-green-700"
//                   >
//                     Manage Subscription
//                   </button>
//                 ) : (
//                   <button
//                     onClick={handleUpgrade}
//                     className="px-4 py-2 mt-4 font-medium text-white bg-gray-900 rounded hover:bg-blue-700"
//                   >
//                     Upgrade Now
//                   </button>
//                 )}
//                 <p className="mt-3 text-sm text-gray-600">
//                   {subscriptionStatus === "premium"
//                     ? "You have access to all premium features."
//                     : "Unlock advanced analytics, AI insights, and more by upgrading."}
//                 </p>
//               </div>
//             </div>

//             {/* Transactions List */}
//             <div className="p-6 space-y-4 bg-white rounded-lg shadow">
//               <h2 className="pb-2 text-xl font-semibold border-b">
//                 Recent Transactions
//               </h2>
//               {transactions.length === 0 ? (
//                 <p className="text-gray-500">
//                   No transactions yet. Add your first one to get started.
//                 </p>
//               ) : (
//                 <ul className="divide-y divide-gray-200">
//                   {transactions.slice(0, 10).map((tx, index) => (
//                     <li
//                       key={`${tx.id || index}`}
//                       className="flex items-center justify-between py-3"
//                     >
//                       <div className="text-sm font-medium text-gray-900">
//                         {tx.notes || "No description"}
//                       </div>
//                       <div
//                         className={`text-sm font-semibold ${
//                           Number(tx.amount) < 0
//                             ? "text-red-600"
//                             : "text-green-700"
//                         }`}
//                       >
//                         ${formatAmount(tx.amount)}
//                       </div>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//               {transactions.length > 0 && (
//                 <p className="mt-4 text-sm text-gray-500">
//                   Showing {transactions.slice(0, 10).length} of{" "}
//                   {transactions.length} total transactions.
//                 </p>
//               )}
//             </div>
//           </>
//         )}
//       </div>
//       <FloatingAIChat />
//     </div>
//   );
// }

"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/app/lib/constant";
import Charts from "../../components/dashboard/Charts";
import BalanceCard from "@/app/components/dashboard/BalanceCard";
import FloatingAIChat from "../aiChat/page";

export default function DashboardPage() {
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [loading, setLoading] = useState(true);

  const getToken = () => {
    try {
      return localStorage.getItem("authToken");
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const token = getToken();
        if (!token) return;

        const dashRes = await axios.get(
          `${API_BASE_URL}/transactions/dashboard-data`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (dashRes.data?.dashboard) {
          setSummary(dashRes.data.dashboard);
          setSubscriptionStatus(
            dashRes.data.dashboard.subscriptionStatus || "free"
          );
        }

        if (dashRes.data?.categories) setCategories(dashRes.data.categories);

        const txRes = await axios.get(`${API_BASE_URL}/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (txRes.data?.transactions) setTransactions(txRes.data.transactions);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleUpgrade = () => (window.location.href = "/pricing");

  const handleManageSubscription = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await axios.post(
        `${API_BASE_URL}/stripe/create-portal-session`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.url) window.location.href = res.data.url;
    } catch (err) {
      console.error("Failed to open billing portal:", err);
      alert("Failed to open billing portal.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading dashboard...
      </div>
    );

  const formatAmount = (amount) =>
    Number(amount ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const isNewUser =
    transactions.length === 0 &&
    categories.length === 0 &&
    summary.income === 0 &&
    summary.expense === 0 &&
    summary.balance === 0;

  return (
    <div className="min-h-screen w-full bg-[#f3f4f6] px-4 sm:px-6 py-6">
      <div className="mx-auto space-y-10 max-w-7xl">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-800 sm:text-3xl">
          Dashboard
        </h1>

        {isNewUser ? (
          <div className="p-6 space-y-6 text-center bg-white border border-gray-200 shadow rounded-2xl">
            <h2 className="text-xl font-semibold text-gray-700 sm:text-2xl">
              Welcome to FinTrack!
            </h2>
            <p className="text-gray-600">
              Looks like you’re just getting started. Add your first transaction
              to see insights and charts here.
            </p>
            <button
              onClick={() => (window.location.href = "/transactions")}
              className="px-6 py-2 font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Add Your First Transaction
            </button>
          </div>
        ) : (
          <>
            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <BalanceCard
                income={summary.income}
                expense={summary.expense}
                balance={summary.balance}
              />
            </div>

            {/* Chart + Subscription */}
            <div className="flex flex-col flex-wrap gap-4 lg:flex-row lg:gap-6">
              <div className="flex-1 min-w-[300px] p-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
                <h2 className="mb-4 text-lg font-medium text-gray-700 sm:text-xl">
                  Overview
                </h2>
                {categories.length > 0 ? (
                  <Charts data={categories} />
                ) : (
                  <p className="text-center text-gray-500">
                    No categories or transactions to display.
                  </p>
                )}
              </div>

              <div className="flex flex-col justify-between w-full lg:w-[30%] min-w-[250px] p-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
                <h2 className="mb-2 text-base font-semibold text-gray-800 sm:text-lg">
                  {subscriptionStatus === "premium"
                    ? "Premium Plan"
                    : "Upgrade to Premium"}
                </h2>
                {subscriptionStatus === "premium" ? (
                  <button
                    onClick={handleManageSubscription}
                    className="px-4 py-2 mt-4 font-medium text-white bg-green-600 rounded hover:bg-green-700"
                  >
                    Manage Subscription
                  </button>
                ) : (
                  <button
                    onClick={handleUpgrade}
                    className="px-4 py-2 mt-4 font-medium text-white bg-gray-900 rounded hover:bg-blue-700"
                  >
                    Upgrade Now
                  </button>
                )}
                <p className="mt-3 text-sm text-gray-600 sm:text-base">
                  {subscriptionStatus === "premium"
                    ? "You have access to all premium features."
                    : "Unlock advanced analytics, AI insights, and more by upgrading."}
                </p>
              </div>
            </div>

            {/* Transactions List */}
            <div className="p-6 space-y-4 bg-white rounded-lg shadow">
              <h2 className="pb-2 text-lg font-semibold border-b sm:text-xl">
                Recent Transactions
              </h2>
              {transactions.length === 0 ? (
                <p className="text-gray-500">
                  No transactions yet. Add your first one to get started.
                </p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {transactions.slice(0, 10).map((tx, index) => (
                    <li
                      key={`${tx.id || index}`}
                      className="flex flex-col py-3 sm:flex-row sm:justify-between"
                    >
                      <div className="text-sm font-medium text-gray-900 sm:text-base">
                        {tx.notes || "No description"}
                      </div>
                      <div
                        className={`text-sm sm:text-base font-semibold mt-1 sm:mt-0 ${
                          Number(tx.amount) < 0
                            ? "text-red-600"
                            : "text-green-700"
                        }`}
                      >
                        ${formatAmount(tx.amount)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {transactions.length > 0 && (
                <p className="mt-4 text-sm text-gray-500">
                  Showing {transactions.slice(0, 10).length} of{" "}
                  {transactions.length} total transactions.
                </p>
              )}
            </div>
          </>
        )}
      </div>
      <FloatingAIChat />
    </div>
  );
}
