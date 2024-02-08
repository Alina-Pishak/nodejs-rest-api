const validateBody = require("./validateBody");
const handleMongooseError = require("./handleMongooseError");
const isValidId = require("./isValidId");
const authenticate = require("./authenticate");
const upload = require("./upload");
const resizeAvatar = require("./resizeAvatar");

module.exports = {
  validateBody,
  handleMongooseError,
  isValidId,
  authenticate,
  upload,
  resizeAvatar,
};
