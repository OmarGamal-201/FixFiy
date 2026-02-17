const jwt = require("jsonwebtoken");

// Generate JWT token using userId only
function generateToken(userId) {
  if (!userId) {
    throw new Error("generateToken: userId is required");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(
    { id: userId.toString() },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
}

module.exports = generateToken;
