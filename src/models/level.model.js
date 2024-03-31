import mongoose, { Schema } from "mongoose";

const levelSchema = new Schema(
  {
    level: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Level = mongoose.model("Class", levelSchema);
