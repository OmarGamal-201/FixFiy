const mongoose = require("mongoose");
const { hashPassword, comparePassword } = require("../../utils/hash");
const disposable = require("disposable-email-domains");

const options = {
  discriminatorKey: "role",
  collection: "users",
  timestamps: true,
};

/* =======================
   Base User Schema
======================= */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 30,
      match: /^[a-zA-Z0-9_-]+$/,
      validate: {
        validator: (v) =>
          !["admin", "root", "system", "moderator"].includes(v.toLowerCase()),
        message: "This name is not allowed",
      },
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      validate: {
        validator: (email) =>
          !disposable.includes(email.split("@")[1]),
        message: "Disposable email addresses are not allowed",
      },
    },

    password: {
      type: String,
      required: true,
      minLength: 8,
      validate: {
        validator: (v) =>
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(v),
        message:
          "Password must include uppercase, lowercase, number and special char",
      },
    },

    phone: {
      type: String,
      required: true,
      validate: {
        validator: (v) =>
          /^(\+20|0)?1[0-2,5]\d{8}$/.test(v),
        message: "Invalid phone number",
      },
    },

    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      governorate: { type: String, required: true },
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    profileImage: {
      type: String,
      default: null,
    },

    bio: {
      type: String,
      maxLength: 300,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    settings: {
      language: {
        type: String,
        enum: ["en", "ar"],
        default: "en",
      },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        calls: { type: Boolean, default: true },
      },
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  options,
);

/* =======================
   Indexes
======================= */
userSchema.index({ location: "2dsphere" });
userSchema.index({ createdAt: -1 });

/* =======================
   Password Logic
======================= */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hashPassword(this.password);
  next();
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return comparePassword(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const crypto = require("crypto");
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);

/* =======================
   Client Schema
======================= */
const Client = User.discriminator(
  "client",
  new mongoose.Schema({
    client_rate: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
  }),
);

/* =======================
   Technician (Worker)
======================= */
const Technician = User.discriminator(
  "technician",
  new mongoose.Schema({
    specialties: [
      {
        type: String,
        enum: [
          "plumbing",
          "electrical",
          "carpentry",
          "painting",
          "hvac",
          "appliance_repair",
          "general",
        ],
      },
    ],

    experience_years: {
      type: Number,
      required: true,
      min: 0,
      max: 50,
    },

    availability: {
      isAvailable: {
        type: Boolean,
        default: true,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },

    technician_rate: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    ratingCount: {
      type: Number,
      default: 0,
    },

    totalEarnings: {
      type: Number,
      default: 0,
    },
  }),
);

/* =======================
   Admin Schema
======================= */
const Admin = User.discriminator("admin", new mongoose.Schema({}));

module.exports = { User, Client, Technician, Admin };
