const { PaymentRegistrationSchema } = require("./index");
const { BookingRegistrationSchema } = require("../Booking/index");

// Fetch booking by ID
const getBookingById = async (bookingId) => {
  try {
    const booking = await BookingRegistrationSchema.findById(
      bookingId
    ).populate("payment_id");
    if (!booking) {
      return null;
    }
    return booking;
  } catch (error) {
    console.error("Error fetching booking by ID:", error);
    throw error;
  }
};

// Update booking and payment status
const updateBookingAndPaymentStatus = async (
  bookingId,
  bookingStatus,
  paymentStatus
) => {
  try {
    const booking = await BookingRegistrationSchema.findById(bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Update booking status
    booking.status = bookingStatus;

    // Update payment status
    if (booking.payment_id) {
      const payment = await PaymentRegistrationSchema.findById(
        booking.payment_id
      );
      payment.status = paymentStatus;
      await payment.save();
    }

    await booking.save();
    return booking;
  } catch (error) {
    console.error("Error updating booking and payment status:", error);
    throw error;
  }
};

// Update only booking status
const updateBookingStatus = async (bookingId, status) => {
  try {
    return await BookingRegistrationSchema.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    );
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
};

// Update only payment status
const updatePaymentStatus = async (paymentId, status) => {
  try {
    return await PaymentRegistrationSchema.findByIdAndUpdate(
      paymentId,
      { status },
      { new: true }
    );
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
};

const create = async (params) => {
  const newPayment = await PaymentRegistrationSchema.create(params);
  return newPayment;
};

module.exports = {
  getBookingById,
  updateBookingAndPaymentStatus,
  updateBookingStatus,
  updatePaymentStatus,
  create,
};
