const Joi = require("joi");

module.exports.options = {
  abortEarly: false,
  convert: true,
  stripUnknown: true,
};

const paymentValidationSchema = {
  body: Joi.object().keys({
    amount: Joi.number().greater(0).required(),
    currency: Joi.string()
      .valid("USD", "EUR", "GBP", "INR", "CAD", "AUD", "JPY")
      .required(),
    email: Joi.string().email().required(),
    card_number: Joi.string().creditCard().required(),
    exp_month: Joi.number().integer().min(1).max(12).required(),
    exp_year: Joi.number().integer().min(new Date().getFullYear()).required(),
    cvc: Joi.string().length(3).required(),
  }),
};

module.exports = { paymentValidationSchema };
