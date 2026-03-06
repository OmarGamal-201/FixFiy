module.exports =
  process.env.PAYMENT_PROVIDER === "paypal"
    ? require("./paypal.gateway")
    : require("./mock.gateway");
