import mongoose, { Schema } from "mongoose";

// Define a schema for sections
const sectionSchema = new Schema(
  {
    sectionName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Define a schema for levels
const levelSchema = new Schema(
  {
    level: {
      type: String,
      required: true,
      index: true,
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

// Define models based on the schemas
export const Level = mongoose.model("Level", levelSchema);
export const Section = mongoose.model("Section", sectionSchema);
