const express = require("express");
const router = express.Router();
const schema = require("./schema.js");
const controller = require("./controller.js");
const { celebrate } = require("celebrate");

router.post(
  "/seat_registration",
  // celebrate(schema.seatValidationSchema, schema.options),
  controller.registerSeat
);

router.get(
  "/get_available_seat",
  celebrate(schema.getAvailableSeatsSchema, schema.options),
  controller.getAvailableSeatsList
);

module.exports = router;
