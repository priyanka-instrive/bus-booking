const service = require("./service");

async function createPayment(req, res) {
  const { amount, currency } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Amount must be greater than zero",
    });
  }

  try {
    const paymentIntent = await service.createPayment(amount, currency);

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createPayment,
};
