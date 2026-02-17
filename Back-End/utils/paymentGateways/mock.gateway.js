module.exports.charge = async ({ amount }) => {
  return {
    success: true,
    transactionId: "MOCK_" + Date.now(),
  };
};
