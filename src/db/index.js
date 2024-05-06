const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverApi: {
        version: "1",
        strict: true,
        deprecationErrors: true,
      },
    });

    await mongoose.connection.db.admin().command({ ping: 1 });

    console.log("Connected to database successfully");
  } catch (error) {
    console.log(`database connection failed`);
    process.exit(1);
  }
};

module.exports = connectDB;
