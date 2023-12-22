const { ctrlWrapper, HttpError, sendEmail } = require("../helpers");
const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const fs = require("node:fs/promises");
const path = require("node:path");
const { nanoid } = require("nanoid");

const { SECRET_KEY } = process.env;

const register = async (req, res, next) => {
  const { email, password } = req.body;
  const avatarURL = gravatar.url(email);
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const verificationToken = nanoid();
  const msg = {
    to: email,
    subject: "Verification email",
    html: `<a target="_blank"  href='http://localhost:3000/users/verify/${verificationToken}' >Click to verify email</a>`,
  };
  await sendEmail(msg);

  const newUser = await User.create({
    email,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  res.status(201).json({
    user: { email: newUser.email, subscription: newUser.subscription },
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user.verify) {
    throw HttpError(400, "Your email is not verified");
  }
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
  res.json({
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
  res.json({ email: user.email, subscription: user.subscription });
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
  res.json({
    email: updatedUser.email,
    subscription: updatedUser.subscription,
  });
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
  res.json({ avatarURL });
};

const verifyEmail = async (req, res, next) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw HttpError(404, "User not found");
  }
  await User.findByIdAndUpdate(user.id, {
    verificationToken: null,
    verify: true,
  });
  res.json({ message: "Verification successful" });
};

const resendVerifyEmail = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(404);
  }
  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }
  const msg = {
    to: email,
    subject: "Verification email",
    html: `<a target='_blank' href='http://localhost:3000/users/verify/${user.verificationToken}'>Click to verify your email</a>`,
  };
  await sendEmail(msg);
  res.json({ message: "Verification email sent" });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  getCurrentUser: ctrlWrapper(getCurrentUser),
  updateSubscriptionStatus: ctrlWrapper(updateSubscriptionStatus),
  updateUserAvatar: ctrlWrapper(updateUserAvatar),
  verifyEmail: ctrlWrapper(verifyEmail),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
};
