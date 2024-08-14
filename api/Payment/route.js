const express = require("express");
const router = express.Router();
const { celebrate } = require("celebrate");
const schema = require("./schema.js");

const controller = require("./controller.js");

router.post("/create_payment", controller.createPayment);

module.exports = router;
