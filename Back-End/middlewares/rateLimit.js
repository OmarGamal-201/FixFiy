const rateLimit = require("express-rate-limit");

/**
 * General API rate limiter
 * Applied to all routes
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
});

/**
 * Auth rate limiter
 * Applied to login & register
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
    retryAfter: "15 minutes",
  },
});

/**
 * Password reset limiter
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many password reset attempts, please try again later.",
    retryAfter: "1 hour",
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
};
