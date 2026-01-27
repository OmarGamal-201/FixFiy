const userService = require("./user.service");

// ==================== Profile Management ====================

// Get dashboard data
const getDashboardData = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      governorate,
      city,
      street,
      experience_years,
      specialty,
      availability_status,
    } = req.body;

    // Get current user to check role
    const user = await userService.getUserById(req.user.id);

    const updateData = {};

    // Common fields
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (governorate) updateData["address.governorate"] = governorate;
    if (city) updateData["address.city"] = city;
    if (street) updateData["address.street"] = street;

    // Technician-specific fields
    if (user.role === "technician") {
      if (experience_years !== undefined)
        updateData.experience_years = experience_years;
      if (specialty) updateData.specialty = specialty;
      if (availability_status !== undefined)
        updateData.availability_status = availability_status;
    }

    // Check if there's data to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    // Update user through service
    const updatedUser = await userService.updateUser(req.user.id, updateData);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `This ${field} is already in use`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const updateUserLocation = async (req, res) => {
  try {
    const { coordinates } = req.body; // input shape => coordinates: [lng, lat]
    
    // Validate coordinates exist and have correct shape
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ 
        success: false,
        message: "Coordinates must be an array of [lng, lat]" 
      });
    }

    const [lng, lat] = coordinates;

    // Validate coordinate ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid lat/lng values" 
      });
    }

    // Update user location
    const updatedUser = await userService.updateUserLocation(req.user.id, lng, lat);

    res.status(200).json({
      success: true,
      message: "Location updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
// ==================== Password Management ====================

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "New password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
      });
    }

    // Change password through service
    await userService.changePassword(req.user.id, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    if (error.message === "Current password is incorrect") {
      return res.status(401).json({
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

// ==================== Account Management ====================

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    // Verify password before deletion
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to delete account",
      });
    }

    // Get user with password
    const user = await userService.getUserByEmail(req.user.email);

    const { comparePassword } = require("../../utils/hash");
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Delete user
    await userService.deleteUser(req.user.id);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all technicians
const getAllTechnicians = async (req, res) => {
  try {
    const filters = {};

    if (req.query.specialty) filters.specialty = req.query.specialty;
    if (req.query.availability_status) {
      filters.availability_status = req.query.availability_status === "true";
    }
    if (req.query.min_experience) {
      filters.min_experience = req.query.min_experience;
    }
    if (req.query.governorate) filters.governorate = req.query.governorate;
    if (req.query.city) filters.city = req.query.city;

    const technicians = await userService.getAllTechnicians(filters);

    res.status(200).json({
      success: true,
      count: technicians.length,
      data: technicians,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get technician by ID
const getTechnicianById = async (req, res) => {
  try {
    const technician = await userService.getTechnicianById(req.params.id);

    res.status(200).json({
      success: true,
      data: technician,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Update technician availability (only for technician himself)
const updateAvailability = async (req, res) => {
  try {
    const { availability_status } = req.body;

    if (availability_status === undefined) {
      return res.status(400).json({
        success: false,
        message: "availability_status is required",
      });
    }

    const user = await userService.getUserById(req.user.id);

    if (user.role !== "technician") {
      return res.status(403).json({
        success: false,
        message: "Only technicians can update availability",
      });
    }

    const technician = await userService.updateTechnicianAvailability(
      req.user.id,
      availability_status,
    );

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      data: technician,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get nearest 10 available technician for user
const getNearestTechnicians = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id);
    const nearTechnicians = await userService.getNearestTechnicians(user._id);
    // Check if any technicians were found
    if (!nearTechnicians || nearTechnicians.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No technicians found nearby",
        data: [],
      });
    }
    res.status(200).json({
      success: true,
      message: "Nearest technicians got successfully successfully",
      data: nearTechnicians,
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
  getDashboardData,
  updateProfile,
  changePassword,
  deleteAccount,
  getAllTechnicians,
  getTechnicianById,
  updateAvailability,
  getNearestTechnicians,
  updateUserLocation,
};
