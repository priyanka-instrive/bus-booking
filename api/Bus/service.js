const { BusRegistrationSchema } = require("./index");

const create = async (params) => {
  let newData;

  try {
    newData = await BusRegistrationSchema.create(params);
  } catch (error) {
    console.error("Error in service create method:", error);
    throw error;
  }

  return newData;
};

const findBus = async (params) => {
  console.log("bus_number==>>", params);
  const data = await BusRegistrationSchema.findOne({
    bus_number: params.bus_number,
  });
  console.log("data==>>>", data);

  return data;
};

const getData = async () => {
  console.log("1111111111");

  const data = await BusRegistrationSchema.find();
  console.log("data==>>", data);

  return data;
};

const updateBusSeats = async (bus_id, seats_booked, booking_id) => {
  try {
    // Update the is_booked status and booking_id for the booked seats
    const bus = await BusRegistrationSchema.findById(bus_id);

    if (!bus) {
      throw new Error("Bus not found");
    }

    // Iterate through the bus's seat pattern and update the relevant seats
    bus.seat_pattern.forEach((seat) => {
      if (seats_booked.includes(seat.seat_number)) {
        seat.is_booked = true;
        seat.booking_id = booking_id;
      }
    });

    // Save the updated bus document
    await bus.save();

    console.log("Bus seats updated successfully.");
  } catch (error) {
    console.error("Error updating bus seats:", error);
    throw error;
  }
};

async function updateBusInDb(_id, updateData) {
  try {
    const result = await BusRegistrationSchema.updateOne(
      { _id: _id },
      { $set: updateData }
    );

    return result;
  } catch (error) {
    console.error("Error updating bus in DB:", error);
    throw new Error("Failed to update bus in the database");
  }
}

async function deleteBusFromDb(_id) {
  try {
    const result = await BusRegistrationSchema.deleteOne({
      _id: _id,
    });

    return result;
  } catch (error) {
    console.error("Error deleting bus from DB:", error);
    throw new Error("Failed to delete bus from the database");
  }
}

const findAvailableBuses = async (queryParams) => {
  const { date, departure_time, arrival_time, bus_name, bus_number } =
    queryParams;

  try {
    const matchStage = {};

    if (bus_name) {
      matchStage.bus_name = { $regex: bus_name, $options: "i" };
    }

    if (bus_number) {
      matchStage.bus_number = { $regex: bus_number, $options: "i" };
    }

    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      matchStage.departure_time = {
        $gte: startOfDay,
        $lt: endOfDay,
      };

      if (departure_time) {
        const departureDateTime = new Date(`${date}T${departure_time}`);
        if (!isNaN(departureDateTime)) {
          matchStage.departure_time.$gte = departureDateTime;
        } else {
          throw new Error("Invalid departure_time format provided.");
        }
      }

      if (arrival_time) {
        const arrivalDateTime = new Date(`${date}T${arrival_time}`);
        if (!isNaN(arrivalDateTime)) {
          matchStage.arrival_time = { $lte: arrivalDateTime };
        } else {
          throw new Error("Invalid arrival_time format provided.");
        }
      }
    }

    const buses = await BusRegistrationSchema.find(matchStage);

    return buses;
  } catch (error) {
    console.error("Error in findAvailableBuses function:", error.message);
    throw new Error("Failed to fetch buses. Please try again.");
  }
};

module.exports = {
  findAvailableBuses,
};

module.exports = {
  create,
  findBus,
  updateBusSeats,
  getData,
  updateBusInDb,
  deleteBusFromDb,
  findAvailableBuses,
};
