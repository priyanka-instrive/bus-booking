const { BookingRegistrationSchema } = require("./index");
const { SeatRegistrationSchema } = require("../Seat/index");

const isSeatAlreadyBooked = async (bus_id, booking_date, seats_booked) => {
  const existingBooking = await BookingRegistrationSchema.findOne({
    bus_id,
    booking_date,
    seats_booked: { $in: seats_booked },
    status: "confirmed",
  });

  return !!existingBooking;
};

const createBooking = async (bookingData) => {
  try {
    const newBooking = await BookingRegistrationSchema.create(bookingData);
    return newBooking;
  } catch (error) {
    console.error("Error in bookingService createBooking method:", error);
    throw error;
  }
};

const getBookingById = async (_id) => {
  return await BookingRegistrationSchema.findById(_id);
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

module.exports = {
  isSeatAlreadyBooked,
  createBooking,
  getBookingById,
  updateBookingStatus,
};
