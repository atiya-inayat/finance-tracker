import mongoose from "mongoose";

const userSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    stripePriceId: String,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: { type: Boolean, default: false },
    status: {
      type: String,
      enum: [
        "active",
        "trialing",
        "past_due",
        "canceled",
        "unpaid",
        "incomplete",
        "incomplete_expired",
      ],
      default: "incomplete",
    },
    checkoutSessionId: String, // to avoid duplicate webhook processing
  },
  { timestamps: true }
);

export default mongoose.model("UserSubscription", userSubscriptionSchema);
