const mongoose = require("mongoose");

const pinSchema = new mongoose.Schema({
  pin: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Pin = mongoose.model("Pin", pinSchema);

module.exports = { Pin };