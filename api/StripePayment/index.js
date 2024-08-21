const { Schema, default: mongoose } = require("mongoose");
const { dbConn } = require("../../system/db/mongo");

const purchaseSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
  },
  invoiceId: {
    type: String,
    required: true,
  },
  amountDue: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  purchaseTime: {
    type: Date,
    default: Date.now,
  },
  items: [
    {
      description: String,
      quantity: Number,
      price: Number,
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
});

const Purchase = dbConn.model("Purchase", purchaseSchema, "Purchases");

module.exports = {
  Purchase,
};
