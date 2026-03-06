const express = require("express");
const router = express.Router();
const {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    verifyResetToken,
} = require('./auth.controller');
const { authLimiter, passwordResetLimiter } = require("../../middlewares/rateLimit");
const { protect, checkTokenBlacklist } = require('../../middlewares/auth.middleware')

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', protect, checkTokenBlacklist, logout);
router.post("/forgot-password", forgotPassword); // adding limiters
router.put("/reset-password/:resetToken", resetPassword); // adding limiters
router.get("/verify-reset-token/:resetToken", verifyResetToken);

module.exports = router;