const express = require("express");
const router = express.Router();

const controller = require("./controller.js");

router.post("/create-invoice", controller.createInvoice);
router.get("/purchases/:customerId", controller.getPurchases);

module.exports = router;
