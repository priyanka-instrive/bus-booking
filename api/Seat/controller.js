const service = require("./service");
const { generateSeatPattern } = require("../../system/utils/checks");

async function registerSeat(req, res) {
  try {
    const { bus_id } = req.body;
    const totalSeats = 36;

    // Generate seat pattern dynamically
    const seatPattern = generateSeatPattern(totalSeats);

    // Prepare seat data with dynamically generated seat numbers
    const seatData = seatPattern.map((seat_number) => ({
      number: seat_number,
      is_booked: false,
      booking_date: null,
      booking_id: null,
    }));

    // Create the bus document with the seat data
    const newSeats = await service.create({ bus_id, seat_number: seatData });

    // Return a success response with the newly created seats data
    return res.status(201).json({
      message: "Seats registered successfully",
      data: newSeats,
    });
  } catch (error) {
    console.error("Error registering seats:", error);
    return res.status(500).json({
      message: "Error registering seats",
      error: error.message,
    });
  }
}

async function getAvailableSeatsList(req, res) {
  const { bus_id } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    if (!bus_id) {
      return res.status(400).json({
        success: false,
        message: "bus_id is required",
      });
    }

    const result = await service.getAvailableSeats(bus_id, page, limit);

    res.status(200).json({
      success: true,
      data: result.seats,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  registerSeat,
  getAvailableSeatsList,
};
