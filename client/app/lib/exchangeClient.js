// Client-side exchangerate.host wrapper + simple localStorage cache
import axios from "axios"; // Ensure you are using axios or the native fetch as shown below

const CACHE_KEY = "exchange_rates_cache_v1";
const TTL = 1000 * 60 * 60; // 1 hour (Time to Live)

// IMPORTANT: MUST BE EXPORTED for page.jsx to import and use Object.keys()
export const currencySymbols = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  PKR: "₨",
  INR: "₹",
  AUD: "A$",
  CAD: "CA$",
  // Add other symbols here as needed
};

// Helper function to fetch fresh rates from the external API
async function fetchLatestRates(base = "USD") {
  // Using native fetch for simplicity, but axios is fine too if imported globally
  // The API used here requires no API key and supports cross-origin requests.
  const url = `https://api.exchangerate.host/latest?base=${encodeURIComponent(
    base
  )}`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) {
    // Attempt to parse error response body for more detail
    let errorDetail = "Unknown API error";
    try {
      const data = await r.json();
      errorDetail = data.error || `HTTP Status ${r.status}`;
    } catch (e) {
      errorDetail = `HTTP Status ${r.status} (non-JSON response)`;
    }
    throw new Error(`Failed to fetch exchange rates: ${errorDetail}`);
  }
  return r.json();
}

/**
 * getRate(targetCurrency)
 * Fetches the latest exchange rate for the target currency (based on USD).
 * Uses and updates localStorage cache for performance.
 *
 * returns { rate, base, date, symbol }
 */
export async function getRate(targetCurrency = "USD") {
  try {
    const now = Date.now();
    let cache = null;
    try {
      // Attempt to safely parse the cache from localStorage
      const cachedString = localStorage.getItem(CACHE_KEY);
      if (cachedString) {
        cache = JSON.parse(cachedString);
      }
    } catch (e) {
      console.error("Error parsing cache:", e);
      cache = null; // Invalidate cache if parsing fails
    }

    // Convert target currency code to uppercase
    const target = (targetCurrency || "USD").toUpperCase();

    // 1. Check if cache exists, is not expired, AND contains the target rate.
    if (
      cache &&
      cache.fetchedAt &&
      now - cache.fetchedAt < TTL &&
      typeof cache.rates?.[target] !== "undefined"
    ) {
      const rate = cache.rates[target];
      return {
        rate,
        base: cache.base || "USD",
        date: new Date(cache.fetchedAt).toISOString(),
        symbol: currencySymbols[target] || target,
      };
    }

    // 2. If cache is stale or missing the required rate, fetch fresh rates based on USD.
    const payload = await fetchLatestRates("USD");
    const fetchedAt = Date.now();
    const rates = payload.rates || {};
    const base = payload.base || "USD";

    // 3. Store the new cache
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ fetchedAt, base, rates })
      );
    } catch (e) {
      // ignore storage errors
    }

    // 4. Return the newly fetched rate or default to 1 (if rate is missing)
    const rate = rates[target] ?? 1;

    // Check if rate is zero or invalid, which can happen if the API fails for a specific currency
    if (rate === 0) {
      console.warn(`Rate for ${target} was zero or invalid; defaulting to 1.`);
      return {
        rate: 1,
        base: base,
        date: new Date(fetchedAt).toISOString(),
        symbol: currencySymbols[target] || target,
      };
    }

    return {
      rate,
      base,
      date: new Date(fetchedAt).toISOString(),
      symbol: currencySymbols[target] || target,
    };
  } catch (err) {
    console.warn("getRate error (falling back to 1.0):", err.message);
    // Deterministic fallback to a rate of 1.0 and target symbol
    const target = (targetCurrency || "USD").toUpperCase();
    return {
      rate: 1, // Defaulting to 1 to prevent division by zero or NaN issues
      base: "USD",
      date: null,
      symbol: currencySymbols[target] || target,
    };
  }
}
