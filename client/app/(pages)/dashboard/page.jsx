// "use client";
// import { useEffect, useState } from "react";
// import { getDashboardData } from "@/app/lib/api";
// import BalanceCard from "./BalanceCard";

// export default function DashboardPage() {
//   const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         console.log("📡 Fetching dashboard data...");
//         const data = await getDashboardData();
//         console.log("✅ API Response:", data);

//         if (data) {
//           setSummary(data);
//         }
//       } catch (err) {
//         console.error("❌ Failed to fetch dashboard data:", err);
//       }
//     };

//     fetchData();
//   }, []);

//   useEffect(() => {
//     console.log("🔄 Summary updated:", summary);
//   }, [summary]);

//   return (
//     <BalanceCard
//       income={summary.income}
//       expense={summary.expense}
//       balance={summary.balance}
//     />
//   );
// }

// DashboardPage.js
"use client";
import { useEffect, useState } from "react";
import { getDashboardData } from "@/app/lib/api";
import BalanceCard from "@/app/components/dashboard/BalanceCard";
import Charts from "../../components/dashboard/Charts";
import FloatingAIChat from "../aiChat/page";

export default function DashboardPage() {
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("📡 Fetching dashboard data...");
        // API response: { success: true, dashboard: { income, expense, balance } }
        const { dashboard, categories } = await getDashboardData();
        console.log("✅ API Response:", dashboard, categories);

        if (dashboard) {
          // Update the state with the nested dashboard object
          setSummary(dashboard);
        }
        if (categories) {
          setCategories(categories);
        }
      } catch (err) {
        console.error("❌ Failed to fetch dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log("🔄 Summary updated:", summary);
  }, [summary]);

  return (
    <div>
      <div>
        <BalanceCard
          income={summary.income}
          expense={summary.expense}
          balance={summary.balance}
        />
      </div>

      <div>
        <Charts data={categories} />
      </div>
      <FloatingAIChat />
    </div>
  );
}
