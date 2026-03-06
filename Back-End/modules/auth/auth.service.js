const { User, Client, Technician, Admin } = require("../users/user.model");
const crypto = require("crypto");
const jwt = require("jsonwebtoken"); // ADD THIS
const generateToken = require("../../utils/jwt");
const redisClient = require("../../config/redis"); // Import from config

class AuthService {
  async register(data) {
    const {
      name,
      email,
      password,
      phone,
      address,
      role,
      location,
      experience_years,
      specialty,
    } = data;

    const existing = await User.findOne({ email });
    if (existing) {
      throw new Error("Email already in use");
    }

    let user;

    if (role === "technician") {
      if (!experience_years || !specialty) {
        throw new Error(
          "Experience years and specialty are required for technicians",
        );
      }

      user = await Technician.create({
        name,
        email,
        password,
        phone,
        address,
        location,
        role: "technician",
        experience_years,
        specialty,
      });
    } else {
      user = await Client.create({
        name,
        email,
        password,
        phone,
        address,
        location,
        role: "client",
      });
    }

    const token = generateToken(user._id);

    return { user, token };
  }

  async login(data) {
    const { email, password } = data;

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    // FIX: Should pass user._id, not entire user object
    const token = generateToken(user._id);

    return { user, token };
  }

  // Request password reset
  async requestPasswordReset(email) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User not found");
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    return resetToken;
  }

  async blacklistToken(token) {
    try {
      // Decode token to get expiration
      const decoded = jwt.decode(token);
      
      if (!decoded || !decoded.exp) {
        throw new Error('Invalid token');
      }
      
      // Calculate TTL (time until token expires)
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      
      // Only blacklist if token hasn't expired yet
      if (expiresIn > 0) {
        // Store in Redis with TTL matching token expiration
        await redisClient.setEx(`blacklist_${token}`, expiresIn, 'true');
      }
      
      return true;
    } catch (error) {
      throw new Error('Failed to blacklist token');
    }
  }

  // Reset password using token
  async resetPassword(resetToken, newPassword) {
    // Hash the token to compare with stored token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Find user by token and check if not expired
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error("Invalid or expired reset token");
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return user;
  }

  // Verify reset token
  async verifyResetToken(resetToken) {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    return !!user;
  }

  // Helper method
  async getUserByEmail(email) {
    return await User.findOne({ email });
  }
}

module.exports = new AuthService();