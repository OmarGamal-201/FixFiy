const mongoose = require("mongoose");
const TechnicianService = require("./technicianService.model");
const Service = require("../services/service.model").Service;

class TechnicianServiceService {
  /* =========================
     ADD SERVICE (TECHNICIAN)
  ========================== */
  async addService({ technicianId, serviceId, price, duration_minutes }) {
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      throw new Error("Invalid serviceId");
    }

    const service = await Service.findById(serviceId);
    if (!service) throw new Error("Service not found");

    const exists = await TechnicianService.findOne({
      technicianId,
      serviceId,
    });
    if (exists) throw new Error("Service already added by technician");

    return TechnicianService.create({
      technicianId,
      serviceId,
      price,
      duration_minutes,
    });
  }

  /* =========================
     UPDATE SERVICE
  ========================== */
  async updateService(techServiceId, technicianId, updates) {
    const techService = await TechnicianService.findOne({
      _id: techServiceId,
      technicianId,
    });

    if (!techService) {
      throw new Error("Technician service not found");
    }

    if (updates.price !== undefined) {
      techService.price = updates.price;
    }

    if (updates.duration_minutes !== undefined) {
      techService.duration_minutes = updates.duration_minutes;
    }

    if (updates.isActive !== undefined) {
      techService.isActive = updates.isActive;
    }

    await techService.save();
    return techService;
  }

  /* =========================
     DELETE SERVICE
  ========================== */
  async deleteService(techServiceId, technicianId) {
    const techService = await TechnicianService.findOneAndDelete({
      _id: techServiceId,
      technicianId,
    });

    if (!techService) {
      throw new Error("Technician service not found");
    }

    return { message: "Service removed successfully" };
  }

  /* =========================
     GET MY SERVICES
  ========================== */
  async getMyServices(technicianId) {
    return TechnicianService.find({ technicianId })
      .populate("serviceId", "name category description")
      .sort({ createdAt: -1 });
  }

  /* =========================
     MATCHING (CLIENT)
  ========================== */
  async getTechniciansForService(serviceId) {
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      throw new Error("Invalid serviceId");
    }

    return TechnicianService.find({
      serviceId,
      isActive: true,
    })
      .populate("technicianId", "name technician_rate location")
      .sort({ price: 1 });
  }
}

module.exports = new TechnicianServiceService();
