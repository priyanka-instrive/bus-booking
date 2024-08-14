const Joi = require("joi");

module.exports.options = {
  abortEarly: false,
  convert: true,
  stripUnknown: true,
};

const busRegistrationValidationSchema = {
  body: Joi.object().keys({
    bus_number: Joi.string().required(),
    bus_name: Joi.string().required(),
    total_seats: Joi.number().integer().min(1).required(),
    seat_pattern: Joi.array()
      .items(
        Joi.object({
          seat_number: Joi.string().required(),
          is_booked: Joi.boolean().default(false),
          booking_id: Joi.string().optional().allow(null, ""),
        })
      )
      .optional(),
    departure_time: Joi.date().required(),
    arrival_time: Joi.date().greater(Joi.ref("departure_time")).required(),
    fare: Joi.number().min(0).required(),
    route: Joi.string().default("Chennai to Hyderabad"),
  }),
};

const update = {
  body: Joi.object().keys({
    bus_name: Joi.string().trim().optional(),
    departure_time: Joi.string()
      .pattern(/^\d{2}:\d{2}$/)
      .optional(),
    fare: Joi.number().positive().optional(),
    arrival_time: Joi.string()
      .pattern(/^\d{2}:\d{2}$/)
      .optional(),
    route: Joi.string().trim().optional(),
  }),
  params: Joi.object().keys({
    _id: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
  }),
};

const deleteBusData = {
  params: Joi.object().keys({
    _id: Joi.string().required(),
  }),
};

const getAvailableBusesValidationSchema = Joi.object({
  date: Joi.date().required(),

  departure_time: Joi.string()
    .pattern(/^\d{2}:\d{2}$/)
    .optional(),
  arrival_time: Joi.string()
    .pattern(/^\d{2}:\d{2}$/)
    .optional(),
  bus_name: Joi.string().optional().trim(),

  bus_number: Joi.string().optional().trim(),

  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).default(10),
});

module.exports = {
  busRegistrationValidationSchema,
  deleteBusData,
  update,
  getAvailableBusesValidationSchema,
};
