const crypto = require("crypto");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../middleware/errorResponse");
const User = require("../model/User");
const sendEmail = require("../utils/sendEmail");

// @desc   register user
// @route  Post /register
// @access public

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  //   //creat e token
  //   const token = user.getSignedJwtToken();

  //   res.status(200).json({ success: true, token });

  // replace uporer 2 lined with
  sendTokenResponse(user, 200, res);
});

// @desc   login user
// @route  post /login
// @access public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //Validate email and password
  if (!email || !password) {
    // return next(new ErrorResponse("Please provide an email and password", 400));
    res.json({ message: "Please provide an email and password" });
  }

  //   check for user ``
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    // return next(new ErrorResponse("Please provide an valid email", 401));
    res.json({ message: "Please provide an user" });
  }

  //check if password is matched
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    // return next(new ErrorResponse("Invalid credentials", 401));
    res.json({
      message: "Please provide an email and password, is not matched",
    });
  }

  sendTokenResponse(user, 200, res);
});

// @desc   loged user Now
// @route  post /
// @access protected
exports.logedInUser = asyncHandler(async (req, res, next) => {
  const userlogged = req.user;
  res.status(200).json({ success: true, user: userlogged });
});

//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const option = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, option).json({
    success: true,
    token,
  });
};

// @desc   forgot password
// @route  post /auth/forgotpassword
// @access public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({
      Message: "There is no valid email, please entered a valid email. ",
    });
  }

  //Ger reset Token
  const resetToken = user.getResetPasswordToken();
  console.log(`resetToken`, resetToken);

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/auth/resetPassword/${resetToken}`;

  const message = `You are receiving this email cz u requested to forgoot / reset passord ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset Token",
      message,
    });

    res.status(200).json({ success: true, data: "Email sent" });
  } catch (err) {
    console.log(`err`, err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(400).json({ success: false, data: "Email sent failed" });
  }

  res.status(200).json({ success: true, data: user });
});

// @desc   forgot password
// @route  post /auth/forgotpassword/:resettoken
// @access public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  //Hash the token with
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken, // -> ei name ek filed ace user model e jeita reset token save kore rakhteche !
    resetPasswordExpire: { $gt: Date.now() }, // => also eitao ache model e token exp thakbe 10 min .
  });

  if (!user) {
    return res.status(400).json({ success: false, mess: "INVALID" });
  }

  // set password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res); //-> eita ekta method jeita user model e save kora ache -> see user model
});
