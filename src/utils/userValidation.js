const z = require("zod");

// Define the password validation schema using Zod
const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters")
  // Combined regex for stronger password complexity
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character"
  )
  .nonempty("Password is required");

module.exports = passwordValidation;
