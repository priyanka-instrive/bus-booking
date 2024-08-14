const express = require("express");
const router = express.Router();
const { celebrate } = require("celebrate");
const schema = require("./schema.js");

const controller = require("./controller.js");

router.post(
  "/bus_booking",
  celebrate(schema.bookingValidationSchema, schema.options),
  controller.createBooking
);

router.post("/cancel_booking/:_id", controller.cancelBooking);

module.exports = router;
