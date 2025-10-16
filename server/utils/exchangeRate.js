// // server/utils/exchangeRate.js
// import axios from "axios";

// /**
//  * Simple exchange rate fetcher + in-memory cache.
//  * Uses exchangerate.host (free, no API key).
//  *
//  * - BASE_CURRENCY: currency your DB amounts are stored in (default: USD)
//  * - cacheTTL: milliseconds to cache rates (default: 1 hour)
//  *
//  * Returns: { rate: Number, base: string, date: string, symbol: string }
//  */

// const BASE_CURRENCY = "USD";
// const API_KEY = process.env.EXCHANGE_API_KEY; // put your key in .env
// const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${BASE_CURRENCY}`;

// const cache = {
//   fetchedAt: 0,
//   ttl: 1000 * 60 * 60, // 1 hour
//   rates: null,
//   base: BASE_CURRENCY,
// };

// const SYMBOLS = {
//   USD: "$",
//   EUR: "€",
//   GBP: "£",
//   PKR: "₨",
//   INR: "₹",
//   AUD: "A$",
//   CAD: "CA$",
//   // add more as needed
// };

// export async function getRate(targetCurrency) {
//   if (!targetCurrency) targetCurrency = BASE_CURRENCY;

//   const now = Date.now();
//   if (!cache.rates || now - cache.fetchedAt > cache.ttl) {
//     try {
//       const url = `https://api.exchangerate.host/latest?base=${BASE_CURRENCY}`;
//       const r = await axios.get(url, { timeout: 5000 });
//       if (r?.data?.rates) {
//         cache.rates = r.data.rates;
//         cache.fetchedAt = now;
//         cache.base = r.data.base || BASE_CURRENCY;
//       }
//     } catch (err) {
//       console.warn("Exchange rate fetch failed:", err.message || err);
//       // On failure, keep old cached rates if available, otherwise fallback
//     }
//   }

//   const rate =
//     (cache.rates && cache.rates[targetCurrency]) ||
//     (targetCurrency === BASE_CURRENCY ? 1 : null);

//   return {
//     rate: rate ?? 1, // fallback to 1 if missing
//     base: cache.base || BASE_CURRENCY,
//     symbol: SYMBOLS[targetCurrency] || targetCurrency,
//     date: cache.fetchedAt ? new Date(cache.fetchedAt).toISOString() : null,
//   };
// }
import axios from "axios";

const BASE_CURRENCY = "USD";
const API_KEY = process.env.EXCHANGE_API_KEY; // Ensure this is set in your .env file
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${BASE_CURRENCY}`;

const SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  PKR: "₨",
  INR: "₹",
  AUD: "A$",
  CAD: "CA$",
};

const cache = {
  fetchedAt: 0,
  ttl: 1000 * 60 * 60, // 1 hour
  rates: null,
  base: BASE_CURRENCY,
};

export async function getRate(targetCurrency = BASE_CURRENCY) {
  const now = Date.now();

  // Check if cache is expired
  if (!cache.rates || now - cache.fetchedAt > cache.ttl) {
    try {
      const response = await axios.get(API_URL);

      if (response.data.result === "success") {
        cache.rates = response.data.conversion_rates;
        cache.fetchedAt = now;
        cache.base = response.data.base_code || BASE_CURRENCY;
      } else {
        throw new Error("Failed to fetch exchange rates");
      }
    } catch (err) {
      console.error("Exchange rate fetch failed:", err.message || err);
    }
  }

  // Return cached rate or fallback to 1 if not available
  const rate =
    (cache.rates && cache.rates[targetCurrency]) ||
    (targetCurrency === BASE_CURRENCY ? 1 : null);

  return {
    rate: rate ?? 1,
    base: cache.base || BASE_CURRENCY,
    symbol: SYMBOLS[targetCurrency] || targetCurrency,
    date: cache.fetchedAt ? new Date(cache.fetchedAt).toISOString() : null,
  };
}
