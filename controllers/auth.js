const { ctrlWrapper, HttpError } = require("../helpers");
const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const fs = require("node:fs/promises");
const path = require("node:path");

const { SECRET_KEY } = process.env;

const register = async (req, res, next) => {
  const { email, password } = req.body;
  const avatarURL = gravatar.url(email);
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    email,
    password: hashPassword,
    avatarURL,
  });
  res.status(201).json({
    user: { email: newUser.email, subscription: newUser.subscription },
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }
  const payload = { id: user._id };
  const token = jwt.sign(payload, SECRET_KEY, {
    expiresIn: "2h",
  });
  await User.findByIdAndUpdate(user._id, { token });
  res.status(200).json({
    token,
    user: { email: user.email, subscription: user.subscription },
  });
};

const logout = async (req, res, next) => {
  const { id } = req.user;
  const user = await User.findByIdAndUpdate(id, { token: "" });
  if (!user) {
    throw HttpError(401);
  }
  res.status(204).json();
};

const getCurrentUser = async (req, res, next) => {
  const { id } = req.user;
  const user = await User.findById(id);
  if (!user) {
    throw HttpError(401);
  }
  res.status(200).json({ email: user.email, subscription: user.subscription });
};

const updateSubscriptionStatus = async (req, res, next) => {
  const { id } = req.user;
  const { subscription } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { subscription },
    { new: true }
  );
  if (!updatedUser) {
    throw HttpError(404);
  }
  res
    .status(200)
    .json({ email: updatedUser.email, subscription: updatedUser.subscription });
};

const updateUserAvatar = async (req, res) => {
  const { path: tempPath, originalname } = req.file;
  const { _id } = req.user;
  const filename = _id + originalname;
  const newPath = path.join("public/avatars", filename);
  await fs.rename(tempPath, newPath);
  const avatarURL = path.join("avatars", filename);
  const updatedUser = await User.findByIdAndUpdate(_id, { avatarURL });
  if (!updatedUser) {
    throw HttpError(404);
  }
  res.status(200).json({ avatarURL });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  getCurrentUser: ctrlWrapper(getCurrentUser),
  updateSubscriptionStatus: ctrlWrapper(updateSubscriptionStatus),
  updateUserAvatar: ctrlWrapper(updateUserAvatar),
};
