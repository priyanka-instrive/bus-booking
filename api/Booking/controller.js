const service = require("./service");

const createBooking = async (req, res) => {
  try {
    const { user_id, bus_id, booking_date, seats_booked, total_fare } =
      req.body;

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

    const bookingData = {
      user_id,
      bus_id,
      booking_date,
      seats_booked,
      total_fare,
      status: "confirmed",
    };
    const newBooking = await service.createBooking(bookingData);

    await service.updateBookingStatus(newBooking._id, "confirmed");

    return res.status(201).json({
      message: "Booking created successfully",
      data: newBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(500).json({
      message: "Error creating booking",
      error: error.message,
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { _id } = req.params;

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

module.exports = { createBooking, cancelBooking };
