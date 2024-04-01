import mongoose, { Schema } from "mongoose";

const teacherSchema = new Schema({
  teacherName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
});

export const Teacher = mongoose.model("Teacher", teacherSchema);
