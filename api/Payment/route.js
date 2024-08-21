const express = require("express");
const router = express.Router();

const controller = require("./controller.js");

router.post("/confirm_payment/:_id", controller.confirmPayment);

router.get("/create-checkout-session", controller.creqateCheckoutSession);
router.post("/create-product", controller.createProduct);
router.post("/create-product-price", controller.createProductWithPrice);
router.get("/get-success", controller.createSuccess);
router.get("/get-fail", controller.createFail);
router.post("/payment_invoice", controller.createInvoice);
router.post("/payment_log", controller.createPay);

router.post("/payment_log_details", controller.createInvoiceAndSavePurchase);

router.get("/retrive_charge", controller.retrieveCharge);

module.exports = router;
