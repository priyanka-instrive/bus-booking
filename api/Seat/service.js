const { SeatRegistrationSchema } = require("./index");

const create = async (params) => {
  let newData;

  try {
    newData = await SeatRegistrationSchema.create(params);
  } catch (error) {
    console.error("Error in service create method:", error);
    throw error;
  }

  return newData;
};

const findUser = async (email) => {
  const data = await SeatRegistrationSchema.findOne({ email: email });
  return data;
};

async function getAvailableSeats(busId, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;

    const query = {
      bus_id: busId,
      "seat_number.is_booked": false,
      "seat_number.booking_id": null,
    };

    const availableSeats = await SeatRegistrationSchema.find(query)
      .skip(skip)
      .limit(limit);

    const filteredSeats = availableSeats.map((seat) => {
      return {
        ...seat.toObject(),
        seat_number: seat.seat_number.filter(
          (seatDetail) => !seatDetail.is_booked && !seatDetail.booking_id
        ),
      };
    });

    const totalSeats = await SeatRegistrationSchema.countDocuments(query);

    const totalPages = Math.ceil(totalSeats / limit);

    return {
      seats: filteredSeats,
      pagination: {
        totalSeats,
        totalPages,
        currentPage: page,
      },
    };
  } catch (error) {
    throw new Error(`Error fetching available seats: ${error.message}`);
  }
}

module.exports = {
  create,
  findUser,
  getAvailableSeats,
};
