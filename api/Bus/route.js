const express = require("express");
const router = express.Router();
const { celebrate } = require("celebrate");
const schema = require("./schema.js");

const controller = require("./controller.js");

router.post(
  "/bus_registration",
  celebrate(schema.busRegistrationValidationSchema, schema.options),
  controller.registerBus
);

router.get("/get_all_bus_data", controller.fetchBusData);

router.get("/get_available_buses", controller.getAvailableBuses);

router.put(
  "/update_bus_data/:_id",
  celebrate(schema.update, schema.options),
  controller.updateBusData
);

router.delete(
  "/delete_bus_data/:_id",
  celebrate(schema.deleteBusData, schema.options),
  controller.deleteBus
);

module.exports = router;
