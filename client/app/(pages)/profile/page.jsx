"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/app/lib/constant";

/**
 * app/profile/page.jsx
 * Protected Profile Page (App Router) — redirects to /login if no token
 *
 * Backend endpoints expected on http://localhost:3005/api:
 * GET  /profile/me
 * PUT  /profile/update
 * PUT  /profile/password
 * PUT  /profile/avatar
 * POST /stripe/create-portal-session
 *
 * Auth: uses JWT token stored in localStorage under key "token"
 */

// const API_BASE = "http://localhost:3005/api";

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
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
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

  // helper to read token
  function getToken() {
    try {
      return localStorage.getItem("authToken");
    } catch (err) {
      return null;
    }
  }

  // Fetch user profile — protect route: redirect to /login if no token or fetch fails
  useEffect(() => {
    let mounted = true;
    async function fetchProfile() {
      setLoadingUser(true);

      const token = getToken();
      if (!token) {
        // no token -> redirect to login
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

        // unauthorized or failed -> redirect to login
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
          setDateFormat(data.user.dateFormat || "DD/MM/YYYY");
          setTheme(data.user.theme || "light");
          setLanguage(data.user.language || "en");
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

      const payload = {
        name,
        displayName,
        currency,
        dateFormat,
        theme,
        language,
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

      // update local user state
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

  // Avatar upload: sends FormData with file under 'avatar'
  async function handleAvatarChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // preview locally immediately
    setAvatarPreview(URL.createObjectURL(file));

    // upload to backend
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
          // Do NOT set Content-Type for FormData
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Avatar upload failed");

      // If backend returns updated user object, update local state
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

  // If user is not set (redirect should have happened) — show nothing
  if (!user) {
    return null;
  }

  // Render the advanced Tailwind UI
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
                      onClick={() => {
                        if (fileInputRef.current) fileInputRef.current.click();
                      }}
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
            <div className="bg-white rounded-lg shadow p-4 mt-6">
              <div className="text-sm text-gray-500">Quick Overview</div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {user.totalTransactions || 0}
                  </div>
                  <div className="text-xs text-gray-500">Transactions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    ${user.currentBalance?.toFixed?.(2) ?? "0.00"}
                  </div>
                  <div className="text-xs text-gray-500">Current Balance</div>
                </div>
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
                          // reset to original values from user object
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
                        Date format
                      </label>
                      <select
                        value={dateFormat}
                        onChange={(e) => setDateFormat(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
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

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Language
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="en">English</option>
                        <option value="ur">Urdu</option>
                        <option value="es">Español</option>
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
                        // reset preferences
                        setCurrency(user.currency || "USD");
                        setDateFormat(user.dateFormat || "DD/MM/YYYY");
                        setTheme(user.theme || "light");
                        setLanguage(user.language || "en");
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
