// all controllers
const path = require("path");
const Bootcamp = require("../model/Bootcamp");
const asyncHandler = require("../middleware/async");

// @desc   Get items
// @route  Get /bootcamp
// @access public

exports.getItem = async (req, res) => {
  let query;
  // query

  // copy req.query
  const reqQuery = { ...req.query };

  // find to exclude
  const removeField = ["select", "sort", "page", "limit"];

  //loop the removeField and delete if from the query;
  removeField.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // find data from model
  query = Bootcamp.find(JSON.parse(queryStr)).populate("course");

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // sort
  if (req.query.sort) {
    const sorted = req.query.sort.split(",").join(" ");
    console.log(sorted);

    query = query.sort(sorted);
  } else {
    query = query.sort("-createdAt");
  }

  // pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 100;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  try {
    // executing qury
    const bootcamp = await query;
    // execution of pagination
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    // send result
    res.status(200).json({
      success: true,
      Length: bootcamp.length,
      pagination,
      message: "Get bootcamp successfully",
      Data: bootcamp,
    });
  } catch (error) {
    res.status(400).json({ success: false, Message: error.message });
  }
};

// @desc   Get a single item
// @route  Get /bootcamp/:id
// @access public
exports.getSingleItem = async (req, res) => {
  const id = req.params.id;
  try {
    const bootcamp = await Bootcamp.findById(id).populate("course");
    res.status(200).json({
      success: true,
      Length: bootcamp.length,
      message: "Get bootcamp successfully",
      Data: bootcamp,
    });
  } catch (error) {
    res.status(400).json({ success: false, Message: error.message });
  }
};

// @desc   Post a single item
// @route  Post /bootcamp
// @access public
exports.postItem = async (req, res) => {
  const data = req.body;

  //add user to body
  req.body.user = req.user.id;

  // //checked for published bootcamp
  const publishBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // //if user role is not an admin then they can add only one bootcamp
  if (publishBootcamp && req.user.role !== "admin") {
    return res.status(400).json({
      success: false,
      Message: "You are not An Admin, so can add only one bootcamp.",
    });
  }

  const bootcamp = await Bootcamp.create(data);
  try {
    res.status(200).json({
      success: true,
      message: "Get bootcamp successfully",
      Data: bootcamp,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Get bootcamp failed",
    });
  }
  res.status(200).json({
    success: true,
    message: "Get bootcamp successfully",
    Data: bootcamp,
  });
};

// @desc   Post a single item
// @route  Post /bootcamp
// @access public
exports.bootcampByUser = async (req, res) => {
  bootcampbUser = await Bootcamp.find ({ user: req.user.id });

  res.json(bootcampbUser);
};

// @desc   update a single item
// @route  update /bootcamp
// @access public
exports.putItem = async (req, res) => {
  const id = req.params.id;
  try {
    const bootcamp = await Bootcamp.findById(id);

    if (!bootcamp) {
      return res.status(403).json({
        Data: "There is no bootcamp.Please check it!",
      });
    }

    // Make sure user is admin or owner of this bootcamp
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        Data: "User is not authorize for this bootcamp!",
      });
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      Data: bootcamp,
    });
  } catch (error) {
    res.status(400).json({ success: false, Message: error.message });
  }
};

// @desc   delete a single item
// @route  delete /bootcamp
// @access public
exports.deleteItem = async (req, res) => {
  const id = req.params.id;
  try {
    const bootcamp = await Bootcamp.findById(id);

    // Make sure user is admin or owner of this bootcamp
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        Data: "User is not authorize for this bootcamp!",
      });
    }

    !bootcamp
      ? res.status(200).json({
          success: false,
        })
      : bootcamp.remove();

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(400).json({ success: false, Message: error.message });
  }
};

// @desc   upload photo for bootcamp
// @route  put /bootcamp/:id/photo
// @access private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const bootcamp = await Bootcamp.findById(id);
  if (!bootcamp) {
    return res.status(404).send(`Bootcamp is not found this id`);
  }

  if (!req.files) {
    return res.status(404).send(`please upload a file.`);
  }
  // res.status(400).json({ success: false, Message: error.message });

  const file = req.files.file;
  if (!file.mimetype.startsWith("image")) {
    res.status(400).json(`please upload an image file `);
  }
  // console.log(`req.files`, req.files);

  if (file.size > process.env.MAX_FILE_UPLOAD) {
    res
      .status(400)
      .json(`please upload an file less then ${process.env.MAX_FILE_UPLOAD} `);
  }

  //make a unique file using id in last of name which makes id unique, so that same name file will be overwrites by last uploaded file.

  file.name = `photo_${bootcamp.id}${path.parse(file.name).ext}`;
  // console.log(`file.name`, file.name);

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return res
        .status(400)
        .json(
          `please upload an file less then ${process.env.MAX_FILE_UPLOAD} `
        );
    }

    await Bootcamp.findByIdAndUpdate(id, { photo: file.name });
    res.status(200).json({ success: true, data: file.name });
  });
});
