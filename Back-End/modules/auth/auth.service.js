const { User, Client, Technician, Admin } = require("../users/user.model");
const crypto = require("crypto");
const generateToken = require("../../utils/jwt");

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

    const token = generateToken(user);

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
}

module.exports = new AuthService();
