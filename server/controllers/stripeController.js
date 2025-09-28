// controllers/stripeController.js
import Stripe from "stripe";
import User from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 1️⃣ Create checkout session (frontend → backend)
// export const createCheckoutSession = async (req, res) => {
//   try {
//     const session = await stripe.checkout.sessions.create({
//       mode: "subscription",
//       line_items: [
//         {
//           price: process.env.STRIPE_PRICE_ID, // set in .env
//           quantity: 1,
//         },
//       ],
//       success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`, // ✅ FIXED
//       cancel_url: `${process.env.FRONTEND_URL}/pricing`, // ✅ uses correct var
//       customer_email: req.user.email, // from authMiddleware
//     });

//     res.json({ sessionId: session.id, url: session.url });
//   } catch (err) {
//     console.error("❌ Stripe Checkout Error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };
export const createCheckoutSession = async (req, res) => {
  try {
    console.log("User in checkout:", req.user);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      customer_email: req.user?.email, // safe check
    });
    console.log("Stripe session created:", session);
    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("❌ Stripe Checkout Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 2️⃣ Handle Stripe Webhook (Stripe → backend)
export const handleWebhook = async (req, res) => {
  console.log({ req });
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET // from Stripe dashboard
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle event type
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const customerEmail = session.customer_email;

    try {
      // find user by email and update subscriptionStatus
      await User.findOneAndUpdate(
        { email: customerEmail },
        { subscriptionStatus: "premium", onboardingCompleted: true }
      );
      console.log(`✅ Subscription upgraded for ${customerEmail}`);
    } catch (err) {
      console.error("❌ Error updating user subscription:", err.message);
    }
  }

  res.json({ received: true });
};
