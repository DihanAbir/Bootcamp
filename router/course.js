const express = require("express");
const {
  getCourse,
  getSingleCourse,
  postCourse,
  deleteSingleCourse,
} = require("../controller/course");
const router = express.Router({ mergeParams: true });

const { protect } = require("../middleware/auth");

router.route("/").get(getCourse);
router.route("/").post(protect, postCourse);
router
  .route("/:id")
  .get(protect, getSingleCourse)
  .delete(protect, deleteSingleCourse);

module.exports = router;
