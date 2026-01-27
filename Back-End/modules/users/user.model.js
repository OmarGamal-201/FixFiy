const mongoose = require("mongoose");
const { hashPassword, comparePassword } = require("../../utils/hash");
const disposable = require("disposable-email-domains");

const options = { discriminatorKey: 'role', collection: 'users' };

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minLength: [3, "Name must be at least 3 characters long"],
    maxLength: [30, "Name cannot exceed 30 characters"],
    match: [
      /^[a-zA-Z0-9_-]+$/,
      "Name can only contain letters, numbers, underscores and hyphens",
    ],
    validate: {
      validator: function (v) {
        const prohibited = ["admin", "root", "system", "moderator"];
        return !prohibited.includes(v.toLowerCase());
      },
      message: "This name is not allowed",
    },
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    validate: {
      validator: function (email) {
        const domain = email.split("@")[1];
        return !disposable.includes(domain);
      },
      message: "Disposable email addresses are not allowed",
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [8, "Password must be at least 8 characters long"],
    validate: {
      validator: function (v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
          v,
        );
      },
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
    },
  },
  phone: {
    type: String,
    required: [true, "Phone is required"],
    trim: true,
    validate: {
      validator: function (v) {
        return /^(\+20|0)?1[0-2,5]\d{8}$/.test(v);
      },
      message: "Invalid phone number",
    },
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    governorate: {
      type: String,
      required: true,
      trim: true,
    },
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
}, options);

userSchema.index({ createdAt: -1 });
userSchema.index({ location: "2dsphere" });


// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  const crypto = require("crypto");
  
  // Generate token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Hash password before save if modified/new
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await hashPassword(this.password);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return comparePassword(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Client Model
const Client = User.discriminator('client', new mongoose.Schema({
  client_rate: {
    type: Number,
    min: [0, "Rating cannot be negative"],
    max: [5, "Rating cannot exceed 5"],
    default: 0,
  },
}));

// Technician Model
const Technician = User.discriminator('technician', new mongoose.Schema({
  experience_years: {
    type: Number,
    required: [true, "Experience years is required for technicians"],
    min: [0, "Experience cannot be negative"],
    max: [50, "Experience years seems unrealistic"],
  },
  specialty: {
    type: String,
    required: [true, "Specialty is required for technicians"],
    trim: true,
    enum: {
      values: ['plumbing', 'electrical', 'carpentry', 'painting', 'hvac', 'appliance_repair', 'general'],
      message: '{VALUE} is not a valid specialty'
    }
  },
  availability_status: {
    type: Boolean,
    default: true,
  },
  technician_rate: {
    type: Number,
    min: [0, "Rating cannot be negative"],
    max: [5, "Rating cannot exceed 5"],
    default: 0,
  },
}));

// Admin Model
const Admin = User.discriminator('admin', new mongoose.Schema({}));

module.exports = { User, Client, Technician, Admin };