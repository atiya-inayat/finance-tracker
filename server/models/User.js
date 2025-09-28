import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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

  stripeSubscriptionId: {
    type: String,
  },
  stripeCustomerId: {
    type: String,
  },
  // 🔑 Required for password reset flow
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  subscriptionStatus: {
    type: String,
    default: "free", // free by default
  },
});

const User = mongoose.model("User", userSchema);
export default User;
