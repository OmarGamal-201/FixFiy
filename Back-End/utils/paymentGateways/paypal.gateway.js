const axios = require("axios");

const PAYPAL_BASE = "https://api-m.sandbox.paypal.com";

const getAccessToken = async () => {
  const response = await axios.post(
    `${PAYPAL_BASE}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_SECRET,
      },
    }
  );
  return response.data.access_token;
};

module.exports.charge = async ({ amount }) => {
  const token = await getAccessToken();

  const order = await axios.post(
    `${PAYPAL_BASE}/v2/checkout/orders`,
    {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amount.toFixed(2),
          },
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return {
    success: true,
    transactionId: order.data.id,
    approveUrl: order.data.links.find(l => l.rel === "approve")?.href,
  };
};
