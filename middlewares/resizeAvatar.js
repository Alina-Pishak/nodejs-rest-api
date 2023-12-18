const Jimp = require("jimp");
const { HttpError } = require("../helpers");

const resizeAvatar = async (req, res, next) => {
  try {
    const { path } = req.file;
    const image = await Jimp.read(path);
    await image.resize(250, 250);
    await image.writeAsync(path);
    next();
  } catch (error) {
    throw HttpError(400);
  }
};

module.exports = resizeAvatar;
