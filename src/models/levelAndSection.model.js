// import mongoose from "mongoose";

// const sectionSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     level: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Level",
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// const Section = mongoose.model("Section", sectionSchema);

// const levelSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     sections: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Section",
//       },
//     ],
//   },
//   { timestamps: true }
// );

// const Level = mongoose.model("Level", levelSchema);

// export { Level, Section };
