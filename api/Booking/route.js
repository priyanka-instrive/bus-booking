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

router.get("/retrive_charge", controller.retrieveCharge);

router.post(
  "/cancel_booking/:_id",
  celebrate(schema.cancelBookingValidationSchema),
  controller.cancelBooking
);

module.exports = router;
