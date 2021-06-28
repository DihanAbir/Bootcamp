const express = require("express");
const {
  register,
  login,
  logedInUser,
  forgotPassword,
  resetPassword,
} = require("../controller/auth");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/", protect, logedInUser);
router.post("/forgotPassword", forgotPassword);
router.put("/resetPassword/:resettoken", resetPassword);

module.exports = router;
