const { HttpError } = require("../helpers");

const validateAvatar = (req, res, next) => {
  if (req.file) {
    next();
    return;
  }
  if (Object.keys(req.body).length < 1) {
    throw HttpError(400, "missing required avatar field");
  }
  if (typeof req.body.avatar === "string") {
    throw HttpError(400, "avatar field must be a file");
  }
};

module.exports = validateAvatar;
