const { User, Client, Technician, Admin } = require("../users/user.model");
const { hashPassword, comparePassword } = require("../../utils/hash");

class UserService {
  // ==================== User Management ====================
  
  // Get user by ID
  async getUserById(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

//   // Get user by email
//   async getUserByEmail(email) {
//     const user = await User.findOne({ email });
//     return user;
//   }

//   // Get user by name
//   async getUserByName(name) {
//     const user = await User.findOne({ name });
//     return user;
//   }

//   // Get user with password (for authentication only)
//   async getUserWithPassword(email) {
//     const user = await User.findOne({ email });
//     return user;
//   }

  // Update user profile
  async updateUser(userId, updateData) {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  // Delete user
  async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  // ==================== Password Management ====================

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    // Get user with password
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      throw new Error("Current password is incorrect");
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    return true;
  }

async updateUserLocation(userId, lng, lat) {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      location: {
        type: "Point",
        coordinates: [lng, lat]
      }
    },
    { new: true, runValidators: true }
  );
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}

  
  // ==================== Technician Management ====================

  // Get all technicians with filters
  async getAllTechnicians(filters = {}) {
    const query = {};

    if (filters.specialty) {
      query.specialty = filters.specialty;
    }

    if (filters.availability_status !== undefined) {
      query.availability_status = filters.availability_status;
    }

    if (filters.min_experience) {
      query.experience_years = { $gte: parseInt(filters.min_experience) };
    }

    if (filters.governorate) {
      query["address.governorate"] = filters.governorate;
    }

    if (filters.city) {
      query["address.city"] = filters.city;
    }

    const technicians = await Technician.find(query)
      .select("-password")
      .sort({ technician_rate: -1 });

    return technicians;
  }

  // Get technician by ID
  async getTechnicianById(technicianId) {
    const technician = await Technician.findById(technicianId).select(
      "-password"
    );

    if (!technician) {
      throw new Error("Technician not found");
    }

    return technician;
  }

  // Update technician availability
  async updateTechnicianAvailability(userId, availability_status) {
    const technician = await Technician.findByIdAndUpdate(
      userId,
      { availability_status },
      { new: true, runValidators: true }
    ).select("-password");

    if (!technician) {
      throw new Error("Technician not found");
    }

    return technician;
  }

  // Get nearest 10 available technician for user 
  async getNearestTechnicians(userId) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    const nearTechnicians = await Technician.find({
    _id: { $ne: user._id }, // يستبعد نفسه
    location: {
      $near: {
        $geometry: user.location,
        // $maxDistance: 5000 // 5 km
      }
      },
    availability_status :true
    }).limit(10);
    
    return nearTechnicians
  }

  // ==================== Validation Helpers ====================

  // Check if email exists
  async emailExists(email) {
    const user = await User.findOne({ email });
    return !!user;
  }

}

module.exports = new UserService();