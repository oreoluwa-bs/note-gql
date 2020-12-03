const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.getToken = (req) => {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer")
      ? authHeader.split(" ")[1]
      : "";

  return token;
};

exports.createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie = { jwt: token, cookieOptions };

  // eslint-disable-next-line no-param-reassign
  user.password = undefined;

  return {
    status: "success",
    recordID: user._id,
    token,
    record: user,
  };
};

exports.protect = async (context) => {
  const { token } = context;
  if (!token) {
    throw new Error("You are not logged in! Please login in to get access");
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    throw new Error("The account belonging to the user does not exist");
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    throw new Error("User recently changed password! Please log in again.");
  }

  // Grant access to protected route
  context.user = currentUser;
  // return { user: currentUser };
};
