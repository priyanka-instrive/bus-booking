const Joi = require("joi");

module.exports.options = {
  abortEarly: false,
  convert: true,
  stripUnknown: true,
};

const seatValidationSchema = {
  body: Joi.object().keys({
    bus_id: Joi.string().required(),
    seat_number: Joi.array()
      .items(
        Joi.object().keys({
          number: Joi.string()
            .pattern(/^[A-Za-z0-9]+$/)
            .required(),
          is_booked: Joi.boolean().default(false),
          booking_date: Joi.date().allow(null).default(null),
          booking_id: Joi.string().allow(null),
        })
      )
      .required(),
  }),
};

const getAvailableSeatsSchema = {
  query: Joi.object().keys({
    bus_id: Joi.string().alphanum().length(24).required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).default(10),
  }),
};

module.exports = { seatValidationSchema, getAvailableSeatsSchema };
