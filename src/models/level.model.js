const mongoose = require("mongoose");
const { Schema } = require("mongoose");

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

const Level = mongoose.model("Level", levelSchema);
const Section = mongoose.model("Section", sectionSchema);

module.exports = { Level, Section };
