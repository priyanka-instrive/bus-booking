const { Schema, default: mongoose } = require("mongoose");
const { dbConn } = require("../../system/db/mongo");

const bookingSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bus_id: {
      type: Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
    },
    booking_date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    seats_booked: {
      type: [String],
      required: true,
    },
    total_fare: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "canceled", "pending"],
      default: "pending",
    },
    payment_id: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    checkout_session_id: { type: String },
    payment_status: {
      type: String,
    },
    latest_charge: { type: String },
  },
  {
    timestamps: true,
  }
);

const BookingRegistrationSchema = dbConn.model(
  "Booking",
  bookingSchema,
  "Bookings"
);

module.exports = {
  BookingRegistrationSchema,
};
