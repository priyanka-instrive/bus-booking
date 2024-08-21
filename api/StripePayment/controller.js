const service = require("./service");

async function createInvoice(req, res) {
  const { customerId, line_items } = req.body;
  try {
    const { invoice, savedPurchase } =
      await service.createInvoiceAndSavePurchase(customerId, line_items);

    return res.status(200).json({
      message: "Invoice successfully created and purchase data saved",
      invoice,
      purchase: savedPurchase,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return res
      .status(500)
      .json({ error: "Failed to create invoice and save purchase data" });
  }
}

async function getPurchases(req, res) {
  const { customerId } = req.params;

  try {
    const purchases = await service.getPurchasesByCustomerId(customerId);

    if (purchases.length === 0) {
      return res.status(404).json({
        message: "No purchases found for this customer",
      });
    }

    return res.status(200).json({
      message: "Purchases retrieved successfully",
      purchases,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve purchases",
      error: error.message,
    });
  }
}

module.exports = {
  createInvoice,
  getPurchases,
};
