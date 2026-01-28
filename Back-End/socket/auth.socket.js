const jwt = require("jsonwebtoken");
const userService = require("../modules/users/user.service");

module.exports = async (socket, next) => {
  try {
    console.log("🔐 Socket auth started");

    let token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Not authorized, no token provided"));
    }

    // ❌ لو حد بعت Bearer بالغلط
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return next(new Error("Token expired"));
      }
      if (error.name === "JsonWebTokenError") {
        return next(new Error("Invalid token"));
      }
      throw error;
    }

    const user = await userService.getUserById(decoded.id);

    if (!user) {
      return next(new Error("User not found"));
    }

    // 👇 نفس اللي في protect middleware
    socket.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };

    console.log("✅ Socket authenticated:", socket.user.id);

    next();
  } catch (error) {
    console.error("Socket auth error:", error.message);
    next(new Error("Authentication failed"));
  }
};
