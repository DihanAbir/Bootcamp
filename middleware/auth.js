const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("./errorResponse");
const User = require("../model/User");

//protect routers
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  //    else if (req.cookies.token) {
  //     token = req.cookies.token;

  //   }

  //make sure token existes
  if (!token) {
    return res
      .status(401)
      .json({ Message: "Not authorize to access to this route, no token " });
  }

  try {
    // varify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = await User.findById(decoded.id);
    console.log(`req.user`, req.user);
    next();
  } catch (error) {
    res.status(401).json({ Message: "Not authorize to access to this route" });
  }
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.roles)) {
      return res.status(401).json({ Message: "This role is not exist." });
    }
    next();
  };
};
