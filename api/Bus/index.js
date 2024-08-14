const { Schema, default: mongoose } = require("mongoose");
const { dbConn } = require("../../system/db/mongo");

const busSchema = new Schema(
  {
    bus_number: {
      type: String,
      required: true,
      unique: true,
    },
    bus_name: {
      type: String,
      required: true,
    },
    total_seats: {
      type: Number,
      required: true,
    },

    departure_time: {
      type: Date,
      required: true,
    },
    arrival_time: {
      type: Date,
      required: true,
    },
    fare: {
      type: Number,
      required: true,
    },
    route: {
      type: String,
      default: "Chennai to Hyderabad",
    },
  },
  {
    timestamps: true,
  }
);

const BusRegistrationSchema = dbConn.model("Bus", busSchema, "Buss");

module.exports = {
  BusRegistrationSchema,
};
