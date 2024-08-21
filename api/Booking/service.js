const { BookingRegistrationSchema } = require("./index");
const { SeatRegistrationSchema } = require("../Seat/index");
const { PaymentRegistrationSchema } = require("../Payment/index");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const isSeatAlreadyBooked = async (bus_id, booking_date, seats_booked) => {
  const existingBooking = await BookingRegistrationSchema.findOne({
    bus_id,
    booking_date,
    seats_booked: { $in: seats_booked },
    status: "confirmed",
  });

  return !!existingBooking;
};

// const createBooking = async (bookingData) => {
//   try {
//     // const payment = new PaymentRegistrationSchema(paymentDetails);
//     // await payment.save();

//     // bookingData.payment_id = payment._id;
//     // bookingData.payment_status = payment.status;
//     const newBooking = await BookingRegistrationSchema.create(bookingData);

//     return newBooking;
//   } catch (error) {
//     console.error("Error in bookingService createBooking method:", error);
//     throw error;
//   }
// };

const createBooking = async (bookingData) => {
  try {
    const newBooking = await BookingRegistrationSchema.create(bookingData);
    return newBooking;
  } catch (error) {
    console.error("Error in bookingService createBooking method:", error);
    throw error;
  }
};

const getBookingById = async (bookingId) => {
  try {
    const booking = await BookingRegistrationSchema.findById(bookingId);
    return booking;
  } catch (error) {
    console.error("Error fetching booking:", error);
    throw error;
  }
};

const updateBookingStatus = async (booking_id, status) => {
  const booking = await BookingRegistrationSchema.findById(booking_id);

  if (!booking) {
    throw new Error("Booking not found.");
  }

  booking.status = status;
  await booking.save();

  let seatUpdateData;
  if (status === "canceled") {
    seatUpdateData = {
      "seat_number.$[elem].is_booked": false,
      "seat_number.$[elem].booking_id": null,
    };
  } else if (status === "confirmed") {
    seatUpdateData = {
      "seat_number.$[elem].is_booked": true,
      "seat_number.$[elem].booking_id": booking._id,
    };
  }

  if (seatUpdateData) {
    await SeatRegistrationSchema.updateMany(
      {
        bus_id: booking.bus_id,
        "seat_number.number": { $in: booking.seats_booked },
      },
      {
        $set: seatUpdateData,
      },
      {
        arrayFilters: [{ "elem.number": { $in: booking.seats_booked } }],
      }
    );
  }

  return booking;
};

const processPayment = async (paymentId) => {
  const payment = await PaymentRegistrationSchema.findById(paymentId);
  if (!payment) throw new Error("Payment not found");

  const paymentIntent = await stripe.paymentIntents.retrieve(
    payment.paymentIntentId
  );

  if (paymentIntent.status === "succeeded") {
    payment.status = "succeeded";
    await payment.save();

    await BookingRegistrationSchema.updateOne(
      { payment_id: payment._id },
      { $set: { payment_status: "completed" } }
    );
  } else {
    payment.status = paymentIntent.status;
    await payment.save();
  }

  return payment;
};

const createPaymentIntent = async (amount, currency = "USD", paymentMethod) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: currency,
      payment_method: paymentMethod,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    return paymentIntent.id;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

const refundPayment = async (paymentId) => {
  try {
    const payment = await PaymentRegistrationSchema.findById(paymentId);
    if (!payment) throw new Error("Payment not found");

    const refund = await stripe.refunds.create({
      payment_intent: payment.paymentIntentId,
    });

    if (refund.status === "succeeded") {
      payment.status = "refunded";
      await payment.save();
    }

    return refund;
  } catch (error) {
    console.error("Error processing refund:", error);
    throw error;
  }
};

const create = async (params) => {
  try {
    const newPayment = await PaymentRegistrationSchema.create(params);
    return newPayment;
  } catch (error) {
    console.error("Error in paymentService create method:", error);
    throw error;
  }
};

const updateBookingAfterPayment = async (checkoutSessionId, updateData) => {
  console.log("checkoutSessionId==>>>", checkoutSessionId);
  console.log("updateData==>>>", updateData);

  try {
    const updatedBooking = await BookingRegistrationSchema.findOneAndUpdate(
      { checkout_session_id: checkoutSessionId },
      { $set: updateData },
      { new: true }
    );
    console.log("updatedBooking==>>", updatedBooking);
    return updatedBooking;
  } catch (error) {
    console.error(
      "Error in bookingService updateBookingAfterPayment method:",
      error
    );
    throw error;
  }
};

module.exports = {
  isSeatAlreadyBooked,
  updateBookingAfterPayment,
  createBooking,
  create,
  getBookingById,
  updateBookingStatus,
  processPayment,
  createPaymentIntent,
  refundPayment,
};
