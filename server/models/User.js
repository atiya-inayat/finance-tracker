import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    // 💳 Stripe subscription fields
    stripeSubscriptionId: String,
    stripeCustomerId: String,

    // 🔄 Password reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // 🧭 App onboarding
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    // 🏷️ Subscription plan
    subscriptionStatus: {
      type: String,
      default: "free",
    },

    // 🖼️ Profile Enhancements (NEW)
    avatarUrl: {
      type: String,
      default: null, // will store cloudinary URL
    },
    displayName: {
      type: String,
      default: "",
    },
    currency: {
      type: String,
      default: "USD",
    },
    dateFormat: {
      type: String,
      default: "DD/MM/YYYY",
    },
    theme: {
      type: String,
      default: "light", // light or dark
    },
    language: {
      type: String,
      default: "en",
    },

    // 🔔 Notification preferences (optional for future)
    notifyMonthlySummary: {
      type: Boolean,
      default: true,
    },
    notifyBudgetAlerts: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
