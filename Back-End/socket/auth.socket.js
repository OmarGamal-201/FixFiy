const jwt = require("jsonwebtoken");
const userService = require("../modules/users/user.service");

module.exports = async (socket, next) => {
  try {
    let token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Not authorized"));

    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userService.getUserById(decoded.id);
    if (!user) return next(new Error("User not found"));

    socket.user = {
      id: user._id.toString(),
      role: user.role,
      name: user.name,
    };

    next();
  } catch (err) {
    next(new Error("Authentication failed"));
  }
};
