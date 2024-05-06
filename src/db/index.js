const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connectionInstance = mongoose.connect(
      `${process.env.MONGODB_URI}/${process.env.DB_NAME}`
    );
    console.log(
      `database connection success ${(await connectionInstance).connection.host}`
    );
  } catch (error) {
    console.log(`database connectino failed`);
    process.exit(1);
  }
};

module.exports = connectDB;
