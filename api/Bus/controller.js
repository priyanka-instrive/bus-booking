const service = require("./service");

const registerBus = async (req, res) => {
  const {
    bus_number,
    bus_name,
    total_seats,
    departure_time,
    arrival_time,
    fare,
    route,
  } = req.body;

  try {
    // Check if the bus already exists
    const existingBus = await service.findBus({ bus_number });
    if (existingBus) {
      return res.status(400).json({ error: "Bus number already exists" });
    }

    // Prepare the bus data (without seat pattern)
    const bus = {
      bus_number,
      bus_name,
      total_seats,
      departure_time,
      arrival_time,
      fare,
      route,
    };

    // Save the bus details
    const newBus = await service.create(bus);

    // Response with success message and bus details
    const result = {
      message: "Bus registered successfully",
      detail: newBus,
    };
    return res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function fetchBusData(req, res) {
  try {
    const data = await service.getData();

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    return res.status(200).json({
      data: data,
      message: "All Data Fetch Successfully",
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
}

async function updateBusData(req, res) {
  try {
    const { _id } = req.params;
    const updateData = req.body;

    if (!_id) {
      return res.status(400).json({ message: "Bus ID is required" });
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Update data cannot be empty" });
    }

    const result = await service.updateBusInDb(_id, updateData);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Bus not found" });
    }

    if (result.modifiedCount === 0) {
      return res
        .status(400)
        .json({ message: "No changes were made to the bus data" });
    }

    return res.status(200).json({
      message: "Bus updated successfully",
    });
  } catch (error) {
    console.error("Error in updateBusData controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function deleteBus(req, res) {
  try {
    const { _id } = req.params;

    if (!_id) {
      return res.status(400).json({ message: "Bus ID is required" });
    }

    const result = await service.deleteBusFromDb(_id);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Bus not found" });
    }

    return res.status(200).json({
      message: "Bus deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error in deleteBus controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const getAvailableBuses = async (req, res) => {
  const {
    date,
    departure_time,
    arrival_time,
    bus_name,
    bus_number,
    page = 1,
    limit = 10,
  } = req.query;

  const queryParams = {
    date,
    departure_time,
    arrival_time,
    bus_name,
    bus_number,
  };

  try {
    const buses = await service.findAvailableBuses(queryParams);

    const totalBuses = buses.length;
    const totalPages = Math.ceil(totalBuses / limit);
    const startIndex = (page - 1) * limit;
    const paginatedBuses = buses.slice(startIndex, startIndex + limit);

    if (paginatedBuses.length === 0) {
      return res
        .status(404)
        .json({ message: "No buses available for the given criteria" });
    }

    return res.status(200).json({
      message: "Available buses retrieved successfully",
      data: paginatedBuses,
      pagination: {
        currentPage: page,
        totalPages,
        totalBuses,
        limit,
      },
    });
  } catch (error) {
    console.error("Error retrieving available buses:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerBus,
  fetchBusData,
  updateBusData,
  deleteBus,
  getAvailableBuses,
};
