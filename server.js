const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const cookieParser = require("cookie-parser");
const fileupload = require("express-fileupload");

// custome imports
const connectDB = require("./config/db");

// route file
const bootcamp = require("./router/bootcamp");
const course = require("./router/course");
const auth = require("./router/auth");

// load env files
dotenv.config({ path: "./config/config.env" });

// connection database
connectDB();

const app = express();

// file upload
app.use(fileupload());

//static folder
app.use(express.static(path.join(__dirname, "public")));

// body-parser
app.use(express.json());
app.use(cookieParser());

let PORT = 5000;

// general endpoint
app.get("/", (req, res) => {
  res.send("worked, ok!");
  console.log("Databse connected sucessdfull");
});

// api route
app.use("/bootcamp", bootcamp);
app.use("/course", course);
app.use("/auth", auth);

// listen
app.listen(
  PORT,
  console.log(`Server run successfully on ${process.env.port}`.yellow.bold)
);

// this is optional
// if u want to close the server when accure any error

// handle unhandled promise rejections
// process.on("unhandledRejection", (err, promise) => {
//   console.log(`Error: ${err.message}`);
//   server.close(() => process.exit(1));
// });
