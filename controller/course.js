const asyncHandler = require("../middleware/async");
const Bootcamp = require("../model/Bootcamp");
const Course = require("../model/Course");

// @desc   Get items
// @route  Get /courses
// @route  Get bootcamp/:bootcampId/courses
// @access public

exports.getCourse = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId }).populate({
      path: "bootcamp",
      select: "name description",
    });
  } else {
    query = Course.find().populate({
      path: "bootcamp",
      select: "name description",
    });
  }
  const courses = await query;

  res.status(200).json({
    success: true,
    length: courses.length,
    data: courses,
  });
});

// @desc   Get single items
// @route  Get /courses
// @access public

exports.getSingleCourse = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const courses = await Course.findById(id).populate({
    path: "bootcamp",
    select: "name description",
  });

  res.status(200).json({
    success: true,
    length: courses.length,
    data: courses,
  });
});

// @desc   delete single items
// @route  delete /courses
// @access public

exports.deleteSingleCourse = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const courses = await Course.findById(id).populate({
    path: "bootcamp",
    select: "name description",
  });
  courses.remove(),
    res.status(200).json({
      success: true,
      length: courses.length,
      data: courses,
    });
});

// @desc   Post items
// @route  Post /courses
// @access public

exports.postCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    length: course.length,
    data: course,
  });
});

// bootcamp id: 5d713995b721c3bb38c1f5d0
