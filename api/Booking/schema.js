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
    status: Joi.string().valid("confirmed", "canceled").default("confirmed"),
  }),
};

module.exports = { bookingValidationSchema };
