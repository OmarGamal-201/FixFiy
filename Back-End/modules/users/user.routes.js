const express = require("express");
const router = express.Router();
const {
  updateProfile,
  getDashboardData,
  changePassword,
  deleteAccount,
  getAllTechnicians,
  getTechnicianById,
  updateAvailability,
  updateUserLocation,
  getNearestTechnicians,
} = require("./user.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");
const { uploadUserPicture, processUploadedFiles, handleMulterError } = require('../../middlewares/fileupload');

// Get user dashboard data
router.get("/me", protect, getDashboardData);
// Update user profile (common + role-specific fields)
router.put("/me", protect, uploadUserPicture, handleMulterError, processUploadedFiles, updateProfile);
// Password management
router.put("/change-password", protect, changePassword);
// Account management
router.delete("/delete-account", protect, deleteAccount);
// Technician
router.get("/", getAllTechnicians);
router.get("/nearest", protect, getNearestTechnicians);
router.put("/update-location", protect, updateUserLocation);
router.get("/:id", getTechnicianById);
// Protected route - only technicians
router.put(
  "/availability",
  protect,
  authorize("technician"),
  updateAvailability,
);

module.exports = router;
