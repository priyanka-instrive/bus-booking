const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Purchase } = require("./index");

async function createInvoiceAndSavePurchase(customerId, line_items) {
  try {
    // Create a Stripe Checkout session using dynamic line items
    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: "http://localhost:3000/payment/get-success",
      cancel_url: "http://localhost:3000/payment/get-fail",
    });

    // Calculate the total amount and map items
    const totalAmount = line_items.reduce(
      (item) => item.price_data.unit_amount * item.quantity,
      0
    );
    const items = line_items.map((item) => ({
      description: item.price_data.product_data.name,
      quantity: item.quantity,
      price: item.price_data.unit_amount,
    }));

    // Save purchase data in MongoDB
    const newPurchase = new Purchase({
      customerId: customerId,
      invoiceId: session.id,
      amountDue: totalAmount,
      currency: "usd",
      status: "pending",
      items: items,
      totalAmount: totalAmount,
      paymentMethod: "Stripe Checkout",
      purchaseTime: Date.now(),
    });

    const savedPurchase = await newPurchase.save();
    return { session, savedPurchase };
  } catch (error) {
    console.error("Error in creating invoice and saving purchase:", error);
    throw error;
  }
}

async function getPurchasesByCustomerId(customerId) {
  try {
    const purchases = await Purchase.find({ customerId });
    return purchases;
  } catch (error) {
    console.error("Error fetching purchases:", error);
    throw error;
  }
}

module.exports = {
  createInvoiceAndSavePurchase,
  getPurchasesByCustomerId,
};
