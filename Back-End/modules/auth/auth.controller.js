const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User,Technician,Client, PasswordResetToken } = require("../users/user.model");
const { sendPasswordResetEmail } = require("../../utils/email");
const AuthService=require('./auth.service')



// Register
const register = async (req, res) => {
  try {
    const result = await AuthService.register(req.body);

    return res.status(201).json({
      success: true,
      token: result.token,
      data: result.user,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

//Login
const login = async (req, res) => {
  try {
    const result = await AuthService.login(req.body);

    return res.status(200).json({
      success: true,
      token: result.token,
      data: result.user,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// logout function
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Get token from Bearer
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "No token provided"
      });
    }
    
    // Add token to blacklist
    await AuthService.blacklistToken(token);
    
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Forgot password (request reset)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user exists and get reset token
    const resetToken = await AuthService.requestPasswordReset(email);

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get(
      "host",
    )}/api/auth/reset-password/${resetToken}`;

    // Email message
    const message = `
      You are receiving this email because you (or someone else) has requested the reset of a password.
      
      Please click on the following link to reset your password:
      ${resetUrl}
      
      This link will expire in 10 minutes.
      
      If you did not request this, please ignore this email.
    `;

    try {
      const sendEmail = require("../../utils/sendEmail");

      // Send email
      await sendEmail({
        email,
        subject: "Password Reset Request",
        message,
      });

      res.status(200).json({
        success: true,
        message: "Password reset email sent",
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);

      // If email fails, remove reset token
      const user = await AuthService.getUserByEmail(email);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Email could not be sent",
      });
    }
  } catch (error) {
    if (error.message === "User not found") {
      // Don't reveal that email doesn't exist (security)
      return res.status(200).json({
        success: true,
        message: "If this email exists, a reset link has been sent",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
      });
    }

    // Reset password
    await AuthService.resetPassword(resetToken, password);

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    if (error.message === "Invalid or expired reset token") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Verify reset token
const verifyResetToken = async (req, res) => {
  try {
    const { resetToken } = req.params;

    const isValid = await AuthService.verifyResetToken(resetToken);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reset token is valid",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  logout,
};
