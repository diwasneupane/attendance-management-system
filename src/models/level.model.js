import mongoose, { Schema } from "mongoose";

const sectionSchema = new Schema(
  {
    sectionName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const levelSchema = new Schema(
  {
    level: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    sections: [
      {
        type: Schema.Types.ObjectId,
        ref: "Section",
        required: true,
        index: true,
      },
    ],
  },
  { timestamps: true }
);

export const Level = mongoose.model("Level", levelSchema);
export const Section = mongoose.model("Section", sectionSchema);
