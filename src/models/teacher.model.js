const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  teacherName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
});

const Teacher = mongoose.model("Teacher", teacherSchema);

module.exports = { Teacher };
