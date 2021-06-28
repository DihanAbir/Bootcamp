const mongoose = require("mongoose");

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });
  console.log(`MongooDB connected: ${conn.connection.host}`.yellow.green);
};

module.exports = connectDB;
