import axios from "axios";

export const convertCurrency = async (amount, from, to) => {
  const response = await axios.get(
    `https://api.exchangerate-api.com/v4/latest/${from}`
  );
  const rate = response.data.rates[to];
  return amount * rate;
};
