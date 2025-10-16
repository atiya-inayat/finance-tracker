"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/app/lib/constant";
import axios from "axios";

/**
 * app/profile/page.jsx
 * Protected Profile Page (App Router)
 * - Backend:
 *   GET  /profile/me
 *   PUT  /profile/update
 *   PUT  /profile/password
 *   PUT  /profile/avatar
 *   GET  /transactions/dashboard-data
 *   GET  /transactions
 *
 * Auth: JWT token stored in localStorage under key "authToken"
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

  // overview (quick stats)
  const [overview, setOverview] = useState({
    totalTransactions: 0,
    currentBalance: 0,
    income: 0,
    expense: 0,
  });

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
        currency,
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

  // ------------------------------
  // Transaction overview logic (with two methods for total transaction count)
  // ------------------------------
  useEffect(() => {
    let mounted = true;

    const fetchTransactionOverview = async () => {
      try {
        const token = getToken();
        if (!token) return;

        // 1) Primary: hit dashboard-data endpoint
        const res = await axios.get(
          `${API_BASE_URL}/transactions/dashboard-data`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Dashboard data:", res.data);

        const dashboard = res.data.dashboard || {};
        // dashboard.balance, dashboard.income, dashboard.expense are expected
        const currentBalance = dashboard.balance ?? 0;
        const income = dashboard.income ?? 0;
        const expense = dashboard.expense ?? 0;

        // 2) First try: use dashboard.totalTransactions if backend provides it
        let totalTransactions = dashboard.totalTransactions ?? null;

        // 3) Fallback (Method 2): request /transactions and count
        if (
          totalTransactions === null ||
          typeof totalTransactions === "undefined"
        ) {
          try {
            const allTxRes = await axios.get(`${API_BASE_URL}/transactions`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (allTxRes?.data?.transactions) {
              totalTransactions = allTxRes.data.transactions.length;
              console.log(
                "Total transactions (fallback by fetching /transactions):",
                totalTransactions
              );
            } else {
              // If response structure different, attempt to parse
              const maybeArr = Array.isArray(allTxRes.data)
                ? allTxRes.data
                : null;
              if (maybeArr) {
                totalTransactions = maybeArr.length;
                console.log(
                  "Total transactions (fallback parsing array):",
                  totalTransactions
                );
              } else {
                totalTransactions = 0;
              }
            }
          } catch (err) {
            console.warn(
              "Failed to fetch /transactions for fallback count:",
              err
            );
            totalTransactions = 0;
          }
        } else {
          console.log(
            "Total transactions (from dashboard):",
            totalTransactions
          );
        }

        if (!mounted) return;

        setOverview({
          totalTransactions: totalTransactions || 0,
          currentBalance,
          income,
          expense,
        });
      } catch (err) {
        console.error("Failed to fetch overview data", err);
      }
    };

    fetchTransactionOverview();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              className="ml-4 px-3 py-2 border rounded text-sm"
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
                    <label className="px-3 py-2 bg-gray-100 rounded cursor-pointer text-sm">
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
                      className="px-3 py-2 bg-white border rounded text-sm"
                    >
                      Browse
                    </button>
                  </div>
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
                        className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
                      >
                        Upgrade
                      </a>
                    ) : (
                      <button
                        onClick={handleManageSubscription}
                        disabled={portalLoading}
                        className="px-3 py-2 bg-white border rounded text-sm"
                      >
                        {portalLoading ? "Opening..." : "Manage"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            {/* Quick Stats Card */}
            <div className="bg-white rounded-lg shadow p-4 mt-6">
              <div className="text-sm text-gray-500">Quick Overview</div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {overview?.totalTransactions ?? 0}
                  </div>
                  <div className="text-xs text-gray-500">Transactions</div>
                </div>

                {/* ✅ Current Balance with Deficit Label */}
                <div className="text-center">
                  {overview?.currentBalance < 0 ? (
                    <div className="text-lg font-semibold text-red-600">
                      Deficit: $
                      {Math.abs(Number(overview?.currentBalance ?? 0)).toFixed(
                        2
                      )}
                    </div>
                  ) : (
                    <div className="text-lg font-semibold">
                      ${Number(overview?.currentBalance ?? 0).toFixed(2)}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">Current Balance</div>
                </div>
              </div>

              {/* optional extra small breakdown */}
              <div className="mt-3 text-xs text-gray-500">
                Income: ${Number(overview?.income ?? 0).toFixed(2)} • Expense: $
                {Number(overview?.expense ?? 0).toFixed(2)}
              </div>
            </div>
          </aside>

          {/* Main content (tabs + content) */}
          <main className="col-span-12 md:col-span-8 lg:col-span-9">
            <div className="bg-white rounded-lg shadow p-6">
              {/* Tabs */}
              <div className="flex gap-4 border-b mb-6">
                <TabButton
                  label="Profile"
                  active={activeTab === "profile"}
                  onClick={() => setActiveTab("profile")}
                />
                <TabButton
                  label="Preferences"
                  active={activeTab === "preferences"}
                  onClick={() => setActiveTab("preferences")}
                />
                <TabButton
                  label="Notifications"
                  active={activeTab === "notifications"}
                  onClick={() => setActiveTab("notifications")}
                />
                <TabButton
                  label="Security"
                  active={activeTab === "security"}
                  onClick={() => setActiveTab("security")}
                />
              </div>

              {/* Tab Content */}
              {activeTab === "profile" && (
                <section>
                  <h2 className="text-xl font-semibold mb-4">Profile</h2>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Full name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Display name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-black text-white rounded"
                      >
                        {saving ? "Saving..." : "Save profile"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setName(user.name || "");
                          setDisplayName(user.displayName || "");
                        }}
                        className="px-4 py-2 border rounded"
                      >
                        Reset
                      </button>
                    </div>
                  </form>
                </section>
              )}

              {activeTab === "preferences" && (
                <section>
                  <h2 className="text-xl font-semibold mb-4">Preferences</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Default currency
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="PKR">PKR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Theme
                      </label>
                      <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-black text-white rounded"
                    >
                      Save preferences
                    </button>
                    <button
                      onClick={() => {
                        setCurrency(user.currency || "USD");
                        setTheme(user.theme || "light");
                      }}
                      className="px-4 py-2 border rounded"
                    >
                      Reset
                    </button>
                  </div>
                </section>
              )}

              {activeTab === "notifications" && (
                <section>
                  <h2 className="text-xl font-semibold mb-4">Notifications</h2>
                  <div className="space-y-4">
                    <ToggleRow
                      label="Monthly summary email"
                      checked={notifyMonthlySummary}
                      onChange={() => setNotifyMonthlySummary((s) => !s)}
                    />
                    <ToggleRow
                      label="Budget alerts"
                      checked={notifyBudgetAlerts}
                      onChange={() => setNotifyBudgetAlerts((s) => !s)}
                    />
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-black text-white rounded"
                    >
                      Save notification settings
                    </button>
                  </div>
                </section>
              )}

              {activeTab === "security" && (
                <section>
                  <h2 className="text-xl font-semibold mb-4">Security</h2>
                  <form
                    onSubmit={handleChangePassword}
                    className="space-y-4 max-w-md"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Current password
                      </label>
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        New password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="px-4 py-2 bg-red-600 text-white rounded"
                      >
                        {changingPassword ? "Changing..." : "Change password"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOldPassword("");
                          setNewPassword("");
                        }}
                        className="px-4 py-2 border rounded"
                      >
                        Clear
                      </button>
                    </div>
                  </form>

                  <hr className="my-6" />
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-red-600 mb-2">
                      Danger Zone
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Once you delete your account, all your data will be
                      permanently removed. This action cannot be undone.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      {deleting ? "Deleting..." : "Delete My Account"}
                    </button>
                  </div>
                </section>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small UI subcomponents ---------- */

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 -mb-px ${
        active ? "border-b-2 border-black font-semibold" : "text-gray-600"
      }`}
    >
      {label}
    </button>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded">
      <div>
        <div className="font-medium">{label}</div>
      </div>
      <div>
        <label className="inline-flex relative items-center cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-green-500 peer-focus:ring-4 peer-focus:ring-green-300 transition" />
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition" />
        </label>
      </div>
    </div>
  );
}
