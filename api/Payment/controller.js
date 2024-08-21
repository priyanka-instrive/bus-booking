const service = require("./service");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const confirmPayment = async (req, res) => {
  try {
    const { _id } = req.params;
    const paymentData = req.body;

    // Fetch the existing booking by ID
    const existingBooking = await service.getBookingById(_id);

    if (!existingBooking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    if (existingBooking.status === "canceled") {
      return res.status(400).json({
        message: "Booking is already canceled.",
      });
    }

    // Create the payment intent on the backend and handle it with a webhook
    const paymentIntent = await stripe.paymentIntents.create({
      amount: existingBooking.total_fare * 100, // Amount in cents
      currency: paymentData.currency.toLowerCase(),
      metadata: { booking_id: _id },
    });

    // Construct the URL that the client can use to proceed with payment
    const paymentUrl = `https://yourfrontenddomain.com/payment?clientSecret=${paymentIntent.client_secret}&bookingId=${_id}`;

    return res.status(200).json({
      message: "Payment initiated, waiting for confirmation.",
      paymentUrl,
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return res.status(500).json({
      message: "Error confirming payment",
      error: error.message,
    });
  }
};

// This is your test secret API key.

const createProduct = async (req, res) => {
  try {
    const product = await stripe.products.create({
      name: "T-shirt",
    });

    // Send the created product as a response
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    // Handle any errors that occur during the product creation
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createProductWithPrice = async (req, res) => {
  try {
    // Create a product
    const product = await stripe.products.create({
      name: "top",
    });

    // Create a price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 1000,
      currency: "usd",
    });

    // Send the created product and price as a response
    res.status(201).json({
      success: true,
      data: {
        product,
        price,
      },
    });
  } catch (error) {
    // Handle any errors that occur during the product or price creation
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const creqateCheckoutSession = async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: "price_1PplYsG0SXFORBZDBZ8dZMZh",
        quantity: 4,
      },
    ],
    mode: "payment",
    success_url: "http://localhost:3000/payment/get-success",
    cancel_url: "http://localhost:3000/payment/get-fail",
  });

  res.redirect(303, session.url);
};

const createFail = async (req, res) => {
  try {
    res.status(201).json({
      fail: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createSuccess = async (req, res) => {
  try {
    res.status(201).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

async function createInvoice(req, res) {
  const { customerId } = req.body;
  try {
    const invoice = await stripe.invoices.create({
      customer: customerId,
    });
    console.log("Invoice created successfully:", invoice);
    return res.status(200).json({
      message: "invoice successfully created",
      invoice,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
}

async function createPay(req, res) {
  const { payId } = req.body;
  try {
    const invoice = await stripe.invoices.pay(payId);
    console.log("Invoice created successfully:", invoice);
    return res.status(200).json({
      message: "invoice successfully created",
      invoice,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
}

async function createInvoiceAndSavePurchase(customerId) {
  try {
    // Create invoice using Stripe
    const invoice = await stripe.invoices.create({
      customer: customerId,
    });

    // Save purchase data in MongoDB
    const newPurchase = new Purchase({
      customerId: customerId,
      invoiceId: invoice.id,
      amountDue: invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status,
    });

    const savedPurchase = await newPurchase.save();
    console.log("Purchase saved successfully:", savedPurchase);
    return savedPurchase;
  } catch (error) {
    console.error("Error in processing:", error);
    throw error;
  }
}

const createPaymentLog = async (session, eventType) => {
  const paymentLogParams = {};

  paymentLogParams.customer_id = session.customer;
  paymentLogParams.event_type = eventType;
  paymentLogParams.payment_status = session.status;
  paymentLogParams.event_id = session.id;
  paymentLogParams.status = 1;
  paymentLogParams.payment_id = session.id;

  paymentLogParams.latest_charge = session.latest_charge;

  await service.create(paymentLogParams);
};

async function retrieveCharge(req, res) {
  const { chargeId } = req.query;
  try {
    const charge = await stripe.charges.retrieve(chargeId);
    console.log("Charge retrieved successfully:", charge);
    return res.status(200).send(charge.receipt_url);
  } catch (error) {
    console.error("Error retrieving charge:", error);
    throw error;
  }
}

module.exports = {
  confirmPayment,
  createPaymentLog,
  createInvoice,
  createFail,
  createSuccess,
  creqateCheckoutSession,
  createProduct,
  createProductWithPrice,
  createPay,
  createInvoiceAndSavePurchase,
  retrieveCharge,
};
