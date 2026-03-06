const jwt = require("jsonwebtoken");
const userService = require("../modules/users/user.service");
const redisClient = require("../config/redis"); // ADD THIS

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (without password)
      const user = await userService.getUserById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      // Add user and token to request object
      req.user = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
      req.token = token; // ADD THIS for checkTokenBlacklist

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired, please login again",
        });
      }

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }

      throw error;
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server error in authentication",
      error: error.message,
    });
  }
};

// Check if token is blacklisted
const checkTokenBlacklist = async (req, res, next) => {
  try {
    const token = req.token; // Use token from protect middleware
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    // Check if token is blacklisted
    const isBlacklisted = await redisClient.get(`blacklist_${token}`);
    
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been invalidated. Please login again.'
      });
    }
    
    next();
  } catch (error) {
    console.error('Blacklist check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};



module.exports = {
  protect,
  checkTokenBlacklist,
};