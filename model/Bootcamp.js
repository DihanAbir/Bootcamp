const mongoose = require("mongoose");

const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "This is field is required!"],
      unique: true,
      trim: true,
      maxLength: [50, "Name can to be more then 50 character"],
    },
    slug: String,
    description: {
      type: String,
      required: [true, "This is field is required!"],
      unique: true,
      maxLength: [500, "Name can to be more then 500 character"],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "Please Enter a valid website.",
      ],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    careers: {
      type: [String],
      required: [true, "This field is required"],
      enum: [
        "Web Development",
        "UI/UX",
        "Business",
        "Mobile Development",
        "Data Science",
      ],
    },
    averageRating: {
      type: Number,
      min: [1, "Have to put minimun 1 rating"],
      max: [10, "Have to put maxmun 10 rating"],
    },
    averageCost: {
      type: Number,
    },
    photo: {
      type: String,
      default: "no-photo.png",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtual: true },
  }
);

// delete all the coused on perticulat bootcamp
BootcampSchema.pre("remove", async function (next) {
  await this.model("Course").deleteMany({ bootcamp: this._id });
  next();
});

// reverse populate
BootcampSchema.virtual("course", {
  ref: "Course",
  localField: "_id",
  foreignField: "bootcamp",
  justOne: false,
});

module.exports = mongoose.model("Bootcamp", BootcampSchema);
