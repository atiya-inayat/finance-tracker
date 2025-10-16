"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/app/lib/constant";
import axios from "axios";
import { getRate, currencySymbols } from "@/app/lib/exchangeClient"; // adjust path if different

/**
 * app/profile/page.jsx
 * Protected Profile Page (App Router)
 */
export default function ProfilePage() {
  const router = useRouter();
  // user + loading state
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  // UI state
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  // profile form state
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  // NOTE: 'currency' state drives the conversion. It is set from user profile data.
  const [currency, setCurrency] = useState("USD");
  const [theme, setTheme] = useState("light");
  const [notifyMonthlySummary, setNotifyMonthlySummary] = useState(true);
  const [notifyBudgetAlerts, setNotifyBudgetAlerts] = useState(true);
  // password form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  // avatar
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  // stripe portal
  const [portalLoading, setPortalLoading] = useState(false);
  // delete account
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ------------------------------
  // CURRENCY CONVERSION: New state for overview and transactions
  // ------------------------------

  // keep existing overview raw state that you already have (raw USD from backend)
  const [overviewRaw, setOverviewRaw] = useState(null);
  // converted overview for display (based on selected currency)
  const [overviewConverted, setOverviewConverted] = useState({
    totalTransactions: 0,
    currentBalance: 0,
    income: 0,
    expense: 0,
    currency: "USD",
    currencySymbol: "$",
  });
  // transaction lists
  const [transactionsRaw, setTransactionsRaw] = useState([]);
  const [transactionsConverted, setTransactionsConverted] = useState([]);

  // helper to read token
  function getToken() {
    try {
      return localStorage.getItem("authToken");
    } catch (err) {
      return null;
    }
  }

  // Fetch user profile — protect route
  useEffect(() => {
    let mounted = true;
    async function fetchProfile() {
      setLoadingUser(true);
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/profile/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (!mounted) return;
        if (res.ok && data.user) {
          setUser(data.user);
          // populate form state
          setName(data.user.name || "");
          setDisplayName(data.user.displayName || "");
          // IMPORTANT: Set currency from user profile here
          setCurrency(data.user.currency || "USD");
          setTheme(data.user.theme || "light");
          setNotifyMonthlySummary(Boolean(data.user.notifyMonthlySummary));
          setNotifyBudgetAlerts(Boolean(data.user.notifyBudgetAlerts));
          setAvatarPreview(data.user.avatarUrl || null);
        } else {
          console.error("Failed to fetch profile:", data);
          router.push("/login");
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
        router.push("/login");
      } finally {
        if (mounted) setLoadingUser(false);
      }
    }
    fetchProfile();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------
  // NEW HOOK 1: Fetch raw dashboard data (USD) and store into overviewRaw
  // ------------------------------
  useEffect(() => {
    let mounted = true;
    const fetchRawOverview = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const r = await axios.get(
          `${API_BASE_URL}/transactions/dashboard-data`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Dashboard data (raw):", r.data);
        // backend returns dashboard in USD (per your requirement)
        if (!mounted) return;
        setOverviewRaw(r.data.dashboard || null);
      } catch (err) {
        console.error("fetchRawOverview error:", err);
      }
    };
    fetchRawOverview();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount (and when you want to refresh)

  // ------------------------------
  // NEW HOOK 2: Convert overviewRaw USD -> selected currency (client-side)
  // ------------------------------
  useEffect(() => {
    let mounted = true;
    const doConvert = async () => {
      if (!overviewRaw) return;
      // if user currency is USD, just copy raw values
      const target = (currency || "USD").toUpperCase();
      if (target === "USD") {
        if (!mounted) return;
        setOverviewConverted({
          totalTransactions: overviewRaw.totalTransactions ?? 0,
          currentBalance:
            overviewRaw.balance ?? overviewRaw.currentBalance ?? 0,
          income: overviewRaw.income ?? 0,
          expense: overviewRaw.expense ?? 0,
          currency: "USD",
          currencySymbol: currencySymbols["USD"] || "$",
        });
        return;
      }
      try {
        const { rate, symbol } = await getRate(target);
        // ensure numbers
        const incomeUSD = Number(overviewRaw.income ?? 0);
        const expenseUSD = Number(overviewRaw.expense ?? 0);
        const balanceUSD = Number(
          overviewRaw.balance ?? overviewRaw.currentBalance ?? 0
        );
        const conv = {
          totalTransactions: overviewRaw.totalTransactions ?? 0,
          currentBalance: Number(balanceUSD * rate),
          income: Number(incomeUSD * rate),
          expense: Number(expenseUSD * rate),
          currency: target,
          currencySymbol: symbol || currencySymbols[target] || target,
        };
        if (!mounted) return;
        setOverviewConverted(conv);
      } catch (err) {
        console.error("Conversion failed:", err);
        // fallback to USD if conversion fails
        if (!mounted) return;
        setOverviewConverted({
          totalTransactions: overviewRaw.totalTransactions ?? 0,
          currentBalance:
            overviewRaw.balance ?? overviewRaw.currentBalance ?? 0,
          income: overviewRaw.income ?? 0,
          expense: overviewRaw.expense ?? 0,
          currency: "USD",
          currencySymbol: currencySymbols["USD"] || "$",
        });
      }
    };
    doConvert();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overviewRaw, currency]);

  // ------------------------------
  // NEW HOOK 3: Fetch raw transaction list
  // ------------------------------
  useEffect(() => {
    let mounted = true;
    const fetchTx = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const r = await axios.get(`${API_BASE_URL}/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!mounted) return;
        // Assuming transactions are returned in r.data.transactions
        setTransactionsRaw(r.data.transactions || []);
      } catch (err) {
        console.error("fetch tx err", err);
      }
    };
    fetchTx();
    return () => {
      mounted = false;
    };
  }, []); // call whenever you want to refresh

  // ------------------------------
  // NEW HOOK 4: Convert transaction list USD -> selected currency
  // ------------------------------
  useEffect(() => {
    let mounted = true;
    const doConvertTx = async () => {
      const target = (currency || "USD").toUpperCase();
      if (!transactionsRaw?.length) {
        setTransactionsConverted([]);
        return;
      }
      try {
        const { rate, symbol } = await getRate(target);
        const conv = transactionsRaw.map((t) => {
          const amountUSD = Number(t.amount || 0);
          return {
            ...t,
            amountConverted: Number(amountUSD * rate),
            currency: target,
            currencySymbol: symbol,
          };
        });
        if (!mounted) return;
        setTransactionsConverted(conv);
      } catch (err) {
        console.warn("tx conversion failed", err);
        // fallback to USD
        if (!mounted) return;
        setTransactionsConverted(
          transactionsRaw.map((t) => ({
            ...t,
            amountConverted: t.amount,
            currency: "USD",
            currencySymbol: "$",
          }))
        );
      }
    };
    doConvertTx();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionsRaw, currency]);

  // REMOVED OLD OVERVIEW FETCH LOGIC (Replaced by NEW HOOKS 1 & 2)

  // Save profile (name, displayName, preferences)
  async function handleSaveProfile(e) {
    e && e.preventDefault();
    setSaving(true);
    try {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }
      // Only send fields that exist in backend - removed dateFormat & language
      const payload = {
        name,
        displayName,
        currency, // This is the new currency being saved
        theme,
        notifyMonthlySummary,
        notifyBudgetAlerts,
      };
      const res = await fetch(`${API_BASE_URL}/profile/update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");
      setUser(data.user || { ...user, ...payload });
      alert("Profile updated successfully.");

      // NEW: Refresh dashboard and transactions raw data to trigger client-side conversion with new currency
      try {
        const token = getToken();
        if (token) {
          // Refresh dashboard raw data so conversion runs with new currency
          const r = await axios.get(
            `${API_BASE_URL}/transactions/dashboard-data`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setOverviewRaw(r.data.dashboard || null);
          // Also re-fetch transactions
          const txR = await axios.get(`${API_BASE_URL}/transactions`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setTransactionsRaw(txR.data.transactions || []);
        }
      } catch (err) {
        console.warn("refresh after save failed", err);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving profile: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  }

  // Change password
  async function handleChangePassword(e) {
    e && e.preventDefault();
    if (!oldPassword || !newPassword) {
      alert("Please fill both current and new password.");
      return;
    }
    setChangingPassword(true);
    try {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await fetch(`${API_BASE_URL}/profile/password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");
      setOldPassword("");
      setNewPassword("");
      alert("Password changed successfully.");
    } catch (err) {
      console.error(err);
      alert("Password change failed: " + (err.message || err));
    } finally {
      setChangingPassword(false);
    }
  }
  // Delete account
  async function handleDeleteAccount() {
    if (!confirmDelete) {
      const confirmed = window.confirm(
        "⚠️ Are you sure you want to permanently delete your account? This action cannot be undone."
      );
      if (!confirmed) return;
    }
    setDeleting(true);
    try {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await fetch(`${API_BASE_URL}/profile/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete account");
      alert("Your account has been deleted successfully.");
      localStorage.removeItem("authToken");
      router.push("/signup");
    } catch (err) {
      console.error(err);
      alert("Error deleting account: " + (err.message || err));
    } finally {
      setDeleting(false);
    }
  }
  // Avatar upload
  async function handleAvatarChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    try {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch(`${API_BASE_URL}/profile/avatar`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Avatar upload failed");
      if (data.user && data.user.avatarUrl) {
        setUser(data.user);
        setAvatarPreview(data.user.avatarUrl);
      } else if (data.avatarUrl) {
        setAvatarPreview(data.avatarUrl);
      }
      alert("Avatar updated.");
    } catch (err) {
      console.error(err);
      alert("Avatar upload failed: " + (err.message || err));
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }
  // Open Stripe billing portal
  async function handleManageSubscription() {
    try {
      setPortalLoading(true);
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await fetch(
        `${API_BASE_URL}/stripe/create-checkout-session`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to open billing portal");
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("No billing portal URL returned.");
      }
    } catch (err) {
      console.error(err);
      alert("Could not open billing portal: " + (err.message || err));
    } finally {
      setPortalLoading(false);
    }
  }

  // Logout helper
  function handleLogout() {
    try {
      localStorage.removeItem("authToken");
    } catch (err) {}
    router.push("/login");
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loader mb-3" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Components for Tabs
  const ProfileTab = (
    <form onSubmit={handleSaveProfile} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">
          User Information
        </h3>
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-gray-700"
          >
            Display Name
          </label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Preferences</h3>
        <div>
          <label
            htmlFor="currency"
            className="block text-sm font-medium text-gray-700"
          >
            Base Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            {Object.keys(currencySymbols).map((code) => (
              <option key={code} value={code}>
                {code} - {currencySymbols[code]}
              </option>
            ))}
            {/* Add more options if needed */}
          </select>
        </div>
        <div>
          <label
            htmlFor="theme"
            className="block text-sm font-medium text-gray-700"
          >
            Theme
          </label>
          <select
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div className="flex items-start">
          <input
            id="notifyMonthlySummary"
            type="checkbox"
            checked={notifyMonthlySummary}
            onChange={(e) => setNotifyMonthlySummary(e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label
            htmlFor="notifyMonthlySummary"
            className="ml-3 text-sm font-medium text-gray-700"
          >
            Send me monthly financial summaries
          </label>
        </div>
        <div className="flex items-start">
          <input
            id="notifyBudgetAlerts"
            type="checkbox"
            checked={notifyBudgetAlerts}
            onChange={(e) => setNotifyBudgetAlerts(e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label
            htmlFor="notifyBudgetAlerts"
            className="ml-3 text-sm font-medium text-gray-700"
          >
            Notify me of budget alerts
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  );

  const PasswordTab = (
    <form
      onSubmit={handleChangePassword}
      className="bg-white p-6 rounded-lg shadow space-y-6"
    >
      <h3 className="text-lg font-semibold border-b pb-2">Change Password</h3>
      <div>
        <label
          htmlFor="oldPassword"
          className="block text-sm font-medium text-gray-700"
        >
          Current Password
        </label>
        <input
          type="password"
          id="oldPassword"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>
      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-gray-700"
        >
          New Password
        </label>
        <input
          type="password"
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={changingPassword}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {changingPassword ? "Changing..." : "Change Password"}
        </button>
      </div>
    </form>
  );

  const SubscriptionTab = (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">
        Subscription & Billing
      </h3>
      <p className="text-gray-700">
        Your current plan status is:
        <span
          className={`inline-flex items-center ml-2 px-3 py-1 rounded-full text-sm font-medium ${
            user.subscriptionStatus === "premium"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {user.subscriptionStatus || "free"}
        </span>
      </p>
      {user.subscriptionStatus === "premium" ? (
        <button
          onClick={handleManageSubscription}
          disabled={portalLoading}
          className="px-6 py-2 bg-yellow-500 text-white font-medium rounded-md hover:bg-yellow-600 disabled:opacity-50"
        >
          {portalLoading ? "Loading Portal..." : "Manage Subscription"}
        </button>
      ) : (
        <a
          href="/pricing"
          className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
        >
          Upgrade to Premium
        </a>
      )}
    </div>
  );

  const DangerZoneTab = (
    <div className="bg-red-50 p-6 rounded-lg shadow border border-red-200 space-y-6">
      <h3 className="text-lg font-semibold text-red-700 border-b border-red-200 pb-2">
        Danger Zone
      </h3>
      <div>
        <h4 className="font-medium text-red-600">Delete Account</h4>
        <p className="text-sm text-red-500 mt-1">
          Permanently delete your account and all associated data. This action
          is irreversible.
        </p>
        <div className="mt-4 flex items-center space-x-4">
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="px-6 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );

  const TransactionsListTab = (
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">
        Recent Transactions ({overviewConverted.currency})
      </h3>
      {transactionsConverted.length === 0 ? (
        <p className="text-gray-500">No transactions found.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {transactionsConverted.slice(0, 10).map(
            (
              tx // Show max 10 recent
            ) => (
              <li
                key={tx.id}
                className="py-3 flex justify-between items-center"
              >
                <div className="text-sm font-medium text-gray-900">
                  {tx.notes || "No description"}
                </div>
                <div
                  className={`text-sm font-semibold ${
                    Number(tx.amountConverted) < 0
                      ? "text-red-600"
                      : "text-green-700"
                  }`}
                >
                  {/* Using toFixed(2) is acceptable here for transaction rows */}
                  {tx.currencySymbol}
                  {Math.abs(Number(tx.amountConverted)).toFixed(2)}
                </div>
              </li>
            )
          )}
        </ul>
      )}
      <p className="text-sm text-gray-500 mt-4">
        Showing {transactionsConverted.slice(0, 10).length} of{" "}
        {transactionsConverted.length} total transactions. Amounts are converted
        to {overviewConverted.currency}.
      </p>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return ProfileTab;
      case "password":
        return PasswordTab;
      case "subscription":
        return SubscriptionTab;
      case "transactions":
        return TransactionsListTab;
      case "danger":
        return DangerZoneTab;
      default:
        return ProfileTab;
    }
  };

  // Render UI
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">Signed in as</div>
            <div className="text-sm font-medium">{user.email}</div>
            <button
              onClick={handleLogout}
              className="ml-4 px-3 py-2 border rounded text-sm bg-white hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-4 lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex flex-col items-center text-center gap-3">
                <img
                  src={avatarPreview || "/default-avatar.png"}
                  alt="avatar"
                  className="w-28 h-28 rounded-full object-cover border"
                />
                <div className="text-lg font-semibold">
                  {user.displayName || user.name}
                </div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <div className="mt-3 w-full">
                  <div className="flex gap-2 justify-center">
                    <label className="px-3 py-2 bg-gray-100 rounded cursor-pointer text-sm hover:bg-gray-200">
                      Change Photo
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 bg-white border rounded text-sm hover:bg-gray-50"
                    >
                      Browse
                    </button>
                  </div>
                  {uploadingAvatar && (
                    <p className="text-xs text-blue-500 mt-2">Uploading...</p>
                  )}
                </div>
                <div className="w-full mt-4 text-center">
                  <div className="text-xs text-gray-500">Subscription</div>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        user.subscriptionStatus === "premium"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.subscriptionStatus || "free"}
                    </span>
                  </div>
                  <div className="mt-3">
                    {user.subscriptionStatus !== "premium" ? (
                      <a
                        href="/pricing"
                        className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Upgrade
                      </a>
                    ) : (
                      <button
                        onClick={handleManageSubscription}
                        disabled={portalLoading}
                        className="px-3 py-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 disabled:opacity-50"
                      >
                        {portalLoading ? "Loading..." : "Manage Subscription"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="mt-6 bg-white rounded-lg shadow p-2 space-y-1">
              {[
                "profile",
                "password",
                "transactions",
                "subscription",
                "danger",
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  } ${tab === "danger" ? "text-red-500 hover:bg-red-50" : ""}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="col-span-12 md:col-span-8 lg:col-span-9">
            {/* This section has been modified to use toLocaleString() for better currency formatting.
              This is where the user will see: current balace, total income, total expense 
              with the new currency symbol and converted value.
            */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Total Transactions Card (Not converted) */}
              <div className="bg-white p-5 rounded-lg shadow">
                <p className="text-sm font-medium text-gray-500">
                  Total Transactions
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {overviewConverted.totalTransactions ?? 0}
                </p>
              </div>

              {/* === START OF FORMATTING CHANGES === */}
              {(() => {
                // Helper function for localizing the amount display
                const formatAmount = (amount) =>
                  Number(amount ?? 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });

                const balance = Number(overviewConverted?.currentBalance ?? 0);
                const income = Number(overviewConverted?.income ?? 0);
                const expense = Number(overviewConverted?.expense ?? 0);

                return (
                  <>
                    {/* Current Balance Card */}
                    <div className="bg-white p-5 rounded-lg shadow">
                      <p className="text-sm font-medium text-gray-500">
                        Current Balance ({overviewConverted.currency})
                      </p>
                      <div
                        className={`text-2xl font-bold mt-1 ${
                          balance < 0 ? "text-red-600" : "text-green-700"
                        }`}
                      >
                        {overviewConverted?.currencySymbol ?? "$"}
                        {formatAmount(Math.abs(balance))}
                      </div>
                    </div>

                    {/* Income Card */}
                    <div className="bg-white p-5 rounded-lg shadow">
                      <p className="text-sm font-medium text-gray-500">
                        Total Income ({overviewConverted.currency})
                      </p>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        {overviewConverted?.currencySymbol ?? "$"}
                        {formatAmount(income)}
                      </p>
                    </div>

                    {/* Expense Card */}
                    <div className="bg-white p-5 rounded-lg shadow">
                      <p className="text-sm font-medium text-gray-500">
                        Total Expense ({overviewConverted.currency})
                      </p>
                      <p className="text-2xl font-bold text-red-600 mt-1">
                        {overviewConverted?.currencySymbol ?? "$"}
                        {formatAmount(expense)}
                      </p>
                    </div>
                  </>
                );
              })()}
              {/* === END OF FORMATTING CHANGES === */}
            </div>

            {/* Tab Content */}
            {renderTabContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
