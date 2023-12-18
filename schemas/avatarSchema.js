const Joi = require("joi");

const avatarSchema = Joi.object({
  avatar: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    destination: Joi.string().required(),
    filename: Joi.string().required(),
    path: Joi.string().required(),
    size: Joi.number().required(),
  })
    .required()
    .messages({
      "any.required": "missing required avatar field",
    }),
});

module.exports = avatarSchema;
