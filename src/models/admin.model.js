import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";

const adminSchema = new Schema(
  {
    username: {
      type: String,
      default: "AdminEliteCa",
    }, // Default username
    password: {
      type: String,
      // default: "Admin123",
      required: [true, "password is must"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// Pre-save hook to set username to "AdminEliteCa" if it's not provided
adminSchema.pre("save", function (next) {
  // Check if the document is newly created and if the username is not provided
  if (this.isNew && !this.username) {
    // Set the username to "AdminEliteCa"
    this.username = "AdminEliteCa";
  }
  next();
});

//bcrypt password
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

adminSchema.methods.generateAccessToken = function () {
  return Jwt.sign(
    {
      _id: this.id,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
adminSchema.methods.generateRefreshToken = function () {
  return Jwt.sign(
    {
      _id: this.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const Admin = mongoose.model("Admin", adminSchema);
