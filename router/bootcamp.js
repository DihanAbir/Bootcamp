const express = require("express");
const {
  getItem,
  getSingleItem,
  postItem,
  putItem,
  bootcampByUser,
  deleteItem,
  bootcampPhotoUpload,
} = require("../controller/bootcamp");

// oncluded other resources
const courseRouter = require("./course");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

// re-route with other resources routes
router.use("/:bootcampId/course", courseRouter);
router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);

router.get("/", getItem);

router.get("/:id", getSingleItem);

router.post("/", protect, postItem);
router.get("/bootcampByUser", protect, bootcampByUser);

router.put("/:id", protect, putItem);

router.delete("/:id", protect, deleteItem);

module.exports = router;
