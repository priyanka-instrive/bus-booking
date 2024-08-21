const { Schema, default: mongoose } = require("mongoose");
const { dbConn } = require("../../system/db/mongo");

const paymentLogSchema = new Schema(
  {
    _id: {
      type: Schema.ObjectId,
      auto: true,
    },
    payment_id: {
      type: String,
    },
    latest_charge: {
      type: String,
    },
    event_type: {
      type: String,
    },
    event_id: {
      type: String,
    },
    event_status: {
      type: String,
    },
    status: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const PaymentRegistrationSchema = dbConn.model(
  "Payment",
  paymentLogSchema,
  "Payments"
);

module.exports = {
  PaymentRegistrationSchema,
};
