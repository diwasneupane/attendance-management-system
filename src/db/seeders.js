import connectDB from "./index.js";
import { Admin } from "../models/admin.model.js";

connectDB().then(async () => {
  await adminSeeder();
  process.exit(1);
});

export const adminSeeder = async () => {
  const existingAdmin = await Admin.findOne();

  if (existingAdmin) {
    console.log("Admin already exists. Skipping registration.");
    return;
  }

  const password = "Admin@123";
  const admin = await Admin.create({ username: "AdminEliteCa", password });

  console.log("Admin registered successfully:", admin);
};
