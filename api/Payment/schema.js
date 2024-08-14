const Joi = require("joi");
const moment = require("moment-timezone");

module.exports.options = {
  abortEarly: false,
  convert: true,
  stripUnknown: true,
};

const validTimeZones = moment.tz.names();

const doctorRegistrationValidationSchema = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8) // Minimum length of 8 characters
      .pattern(new RegExp("(?=.*[a-z])")) // At least one lowercase letter
      .pattern(new RegExp("(?=.*[A-Z])")) // At least one uppercase letter
      .pattern(new RegExp("(?=.*[0-9])")) // At least one digit
      .pattern(new RegExp("(?=.*[!@#$%^&*])")) // At least one special character
      .required(),
    role_id: Joi.string().required(),
    country_id: Joi.string().required(),
    specialty_id: Joi.string().required(),
    time_zone: Joi.string()
      .valid(...validTimeZones)
      .required(),
  }),
};

module.exports = { doctorRegistrationValidationSchema };
