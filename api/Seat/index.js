const { Schema, default: mongoose } = require("mongoose");
const { dbConn } = require("../../system/db/mongo");

const seatBookingSchema = new Schema(
  {
    bus_id: {
      type: Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
    },
    seat_number: [
      {
        number: {
          type: String,
          required: true,
        },
        is_booked: {
          type: Boolean,
          default: false,
        },
        booking_date: {
          type: Date,
          default: null,
        },
        booking_id: {
          type: Schema.Types.ObjectId,
          ref: "Booking",
          default: null,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const SeatRegistrationSchema = dbConn.model("Seat", seatBookingSchema, "Seats");

module.exports = {
  SeatRegistrationSchema,
};
