const service = require("./service");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createBooking = async (req, res) => {
  try {
    const { user_id, bus_id, booking_date, seats_booked, total_fare } =
      req.body;

    // Check if the seats are already booked
    const isSeatBooked = await service.isSeatAlreadyBooked(
      bus_id,
      booking_date,
      seats_booked
    );

    if (isSeatBooked) {
      return res.status(400).json({
        message: "One or more seats are already booked on this date.",
      });
    }

    // Save initial booking data (without payment information) to get the booking ID
    const bookingData = {
      user_id,
      bus_id,
      booking_date,
      seats_booked,
      total_fare,
      status: "pending", // Initial status is pending
      payment_intent_id: null,
      checkout_session_id: null,
      latest_charge: null,
    };

    const newBooking = await service.createBooking(bookingData); // Create the booking and get the ID

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "Bus Seat Booking",
              description: `Booking for bus ID: ${bus_id} on ${booking_date}`,
            },
            unit_amount: total_fare * 100, // Stripe uses the smallest currency unit (cents)
          },
          quantity: seats_booked.length, // Number of seats booked
        },
      ],
      mode: "payment",
      metadata: {
        booking_id: newBooking._id.toString(),
      },
      success_url: `http://localhost:3000/payment/get-success?booking_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/payment/get-fail`,
    });

    await service.updateBookingAfterPayment(newBooking._id, {
      checkout_session_id: session.id,
      latest_charge: session.latest_charge || null,
      total_fare: total_fare,
    });

    return res.status(303).json({
      message: "Booking created successfully, redirecting to payment",
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(500).json({
      message: "Error creating booking",
      error: error.message,
    });
  }
};

const createPaymentLog = async (session, eventType) => {
  try {
    const paymentLogParams = {
      customer_id: session.customer,
      event_type: eventType,
      payment_status: session.payment_status || session.status,
      event_id: session.id,
      payment_id: session.payment_intent || session.id,
      latest_charge: session.latest_charge,
    };

    const paymentLog = await service.create(paymentLogParams);

    const bookingId = session.metadata.booking_id;
    const totalFare = session.amount / 100;
    if (eventType === "payment_intent.succeeded") {
      await service.updateBookingAfterPayment(bookingId, {
        payment_intent_id: session.payment_intent || session.id,
        status: "confirmed",
        payment_id: paymentLog._id,
        latest_charge: session.latest_charge,
        total_fare: totalFare,
      });
    } else if (eventType === "payment_intent.payment_failed") {
      await service.updateBookingAfterPayment(bookingId, {
        status: "failed",
        latest_charge: session.latest_charge,
      });
    } else {
      console.log(`Unhandled event type: ${eventType}`);
    }
  } catch (error) {
    console.error("Error in createPaymentLog:", error);
  }
};

const retrieveCharge = async (req, res) => {
  const { bookingId } = req.query;
  try {
    const booking = await service.getBookingById(bookingId);

    if (!booking || !booking.latest_charge) {
      return res.status(404).send("Booking or latest charge not found.");
    }

    const charge = await stripe.charges.retrieve(booking.latest_charge);

    console.log("Charge retrieved successfully:", charge);

    return res.status(200).send(charge.receipt_url);
  } catch (error) {
    console.error("Error retrieving charge:", error);
    return res.status(500).send("Error retrieving charge.");
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { _id } = req.params;

    // Fetch the existing booking by ID
    const existingBooking = await service.getBookingById(_id);

    // If the booking doesn't exist, return a 404 error
    if (!existingBooking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    // If the booking is already canceled, return a 400 error
    if (existingBooking.status === "canceled") {
      return res.status(400).json({
        message: "Booking is already canceled.",
      });
    }

    // Attempt to refund the payment if a payment ID is associated with the booking
    if (existingBooking.payment_id) {
      const refundResult = await service.refundPayment(
        existingBooking.payment_id
      );

      if (refundResult.status !== "succeeded") {
        return res.status(400).json({
          message: "Refund failed. Unable to cancel booking.",
        });
      }
    }

    // Update the booking status to "canceled"
    const updatedBooking = await service.updateBookingStatus(_id, "canceled");

    return res.status(200).json({
      message: "Booking canceled successfully",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Error canceling booking:", error);
    return res.status(500).json({
      message: "Error canceling booking",
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  retrieveCharge,
  createPaymentLog,
  cancelBooking,
};
