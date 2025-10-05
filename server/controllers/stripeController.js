// // controllers/stripeController.js
// import Stripe from "stripe";
// import User from "../models/User.js";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// // 1️⃣ Create checkout session (frontend → backend)
// // export const createCheckoutSession = async (req, res) => {
// //   try {
// //     const session = await stripe.checkout.sessions.create({
// //       mode: "subscription",
// //       line_items: [
// //         {
// //           price: process.env.STRIPE_PRICE_ID, // set in .env
// //           quantity: 1,
// //         },
// //       ],
// //       success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`, // ✅ FIXED
// //       cancel_url: `${process.env.FRONTEND_URL}/pricing`, // ✅ uses correct var
// //       customer_email: req.user.email, // from authMiddleware
// //     });

// //     res.json({ sessionId: session.id, url: session.url });
// //   } catch (err) {
// //     console.error("❌ Stripe Checkout Error:", err);
// //     res.status(500).json({ error: err.message });
// //   }
// // };
// export const createCheckoutSession = async (req, res) => {
//   try {
//     console.log("User in checkout:", req.user);
//     const session = await stripe.checkout.sessions.create({
//       mode: "subscription",
//       line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
//       success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.FRONTEND_URL}/pricing`,
//       customer_email: req.user?.email, // safe check
//     });
//     console.log("Stripe session created:", session);
//     res.json({ sessionId: session.id, url: session.url });
//   } catch (err) {
//     console.error("❌ Stripe Checkout Error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // 2️⃣ Handle Stripe Webhook (Stripe → backend)
// export const handleWebhook = async (req, res) => {
//   console.log({ req });
//   const sig = req.headers["stripe-signature"];

//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET // from Stripe dashboard
//     );
//   } catch (err) {
//     console.error("❌ Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Handle event type
//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object;
//     const customerEmail = session.customer_email;

//     try {
//       // find user by email and update subscriptionStatus
//       await User.findOneAndUpdate(
//         { email: customerEmail },
//         { subscriptionStatus: "premium", onboardingCompleted: true }
//       );
//       console.log(`✅ Subscription upgraded for ${customerEmail}`);
//     } catch (err) {
//       console.error("❌ Error updating user subscription:", err.message);
//     }
//   }

//   res.json({ received: true });
// };

import Stripe from "stripe";
import User from "../models/User.js";
import UserSubscription from "../models/UserSubscription.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Create Checkout Session
export const createCheckoutSession = async (req, res) => {
  try {
    const customer =
      req.user.stripeCustomerId ||
      (await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
      }));

    if (!req.user.stripeCustomerId) {
      await User.findByIdAndUpdate(req.user.id, {
        stripeCustomerId: customer.id,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.id,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: { userId: req.user.id },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("❌ Error creating session:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Create Billing Portal Session
export const createPortalSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.stripeCustomerId)
      return res.status(400).json({ error: "Customer not found" });

    const portal = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ url: portal.url });
  } catch (error) {
    console.error("❌ Portal error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const sub = await UserSubscription.findOne({ userId: req.user.id });
    if (!sub) return res.status(404).json({ error: "Subscription not found" });

    const updated = await stripe.subscriptions.update(
      sub.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    sub.cancelAtPeriodEnd = true;
    sub.status = updated.status;
    await sub.save();

    res.json({
      success: true,
      message: "Subscription will cancel at period end",
    });
  } catch (error) {
    console.error("❌ Cancel error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Reactivate subscription
export const reactivateSubscription = async (req, res) => {
  try {
    const sub = await UserSubscription.findOne({ userId: req.user.id });
    if (!sub) return res.status(404).json({ error: "Subscription not found" });

    const updated = await stripe.subscriptions.update(
      sub.stripeSubscriptionId,
      {
        cancel_at_period_end: false,
      }
    );

    sub.cancelAtPeriodEnd = false;
    sub.status = updated.status;
    await sub.save();

    res.json({ success: true, message: "Subscription reactivated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Webhook Handler
export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data.object;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = data;
        const userId = session.metadata.userId;
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription
        );

        await UserSubscription.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            userId,
            stripeCustomerId: subscription.customer,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            status: subscription.status,
            currentPeriodStart: new Date(
              subscription.current_period_start * 1000
            ),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            checkoutSessionId: session.id,
          },
          { upsert: true }
        );

        await User.findByIdAndUpdate(userId, { subscriptionStatus: "premium" });
        break;
      }

      case "invoice.payment_failed":
        await updateSubscriptionStatus(data.subscription, "past_due");
        break;

      case "customer.subscription.deleted":
        await updateSubscriptionStatus(data.id, "canceled");
        break;

      case "customer.subscription.updated":
        await updateSubscriptionStatus(data.id, data.status);
        break;
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
  }

  res.json({ received: true });
};

async function updateSubscriptionStatus(subscriptionId, status) {
  const sub = await UserSubscription.findOneAndUpdate(
    { stripeSubscriptionId: subscriptionId },
    { status },
    { new: true }
  );
  if (sub) {
    await User.findByIdAndUpdate(sub.userId, {
      subscriptionStatus: status === "active" ? "premium" : "free",
    });
  }
}
