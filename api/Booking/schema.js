const Joi = require("joi");

module.exports.options = {
  abortEarly: false,
  convert: true,
  stripUnknown: true,
};

const bookingValidationSchema = {
  body: Joi.object().keys({
    user_id: Joi.string().required(),
    bus_id: Joi.string().required(),
    booking_date: Joi.date().required(),
    seats_booked: Joi.array().items(Joi.string()).required(),
    total_fare: Joi.number().required(),
    payment_method: Joi.string().required(), // New field to handle payment method
    status: Joi.string()
      .valid("confirmed", "canceled", "pending")
      .default("pending"), // Update default to 'pending'
    // payment_id: Joi.string().optional().allow(null), // Optional field for payment ID
    // payment_status: Joi.string(),
  }),
};

const cancelBookingValidationSchema = {
  params: Joi.object().keys({
    _id: Joi.string().required(), // Validate the _id parameter
  }),
};

module.exports = { bookingValidationSchema, cancelBookingValidationSchema };
