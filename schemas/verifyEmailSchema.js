const Joi = require("joi");

const verifyEmailSchema = Joi.object({
  email: Joi.string()
    .required()
    .messages({ "any.required": "missing required field email" }),
});

module.exports = verifyEmailSchema;
