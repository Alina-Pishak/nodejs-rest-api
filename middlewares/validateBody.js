const { HttpError } = require("../helpers");

const validateBody = (schema) => (req, res, next) => {
  // if (req.path === "/verify" && Object.keys(req.body).length < 1) {
  //   throw HttpError(400, "Missing required email field");
  // }
  if (
    req.method === "POST" &&
    Object.keys(req.body).length < 1 &&
    req.path !== "/verify"
  ) {
    throw HttpError(400, "Missing fields");
  }
  const { error } = schema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  next();
};

module.exports = validateBody;
