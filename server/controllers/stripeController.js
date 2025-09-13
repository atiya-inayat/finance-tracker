// import Stripe in ES module style
import Stripe from "stripe";

// initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// controller function
export const createCheckoutSession = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: "price_1S6x9OQqFyVJI5du1jdhhy1b", quantity: 1 }],
      success_url:
        "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:3000/pricing",
    });
    res.json({ sessionId: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
