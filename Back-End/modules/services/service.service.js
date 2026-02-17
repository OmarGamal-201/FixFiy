const { Service } = require("./service.model");
const Job = require("../jobs/job.model");

class ServiceService {
  /* ========== ADMIN ========== */
  async addService(data, adminId) {
    const existing = await Service.findOne({ name: data.name });
    if (existing) throw new Error("Service already exists");

    return Service.create({
      ...data,
      created_by: adminId,
    });
  }

  async updateService(serviceId, updatedData) {
    const service = await Service.findByIdAndUpdate(
      serviceId,
      updatedData,
      { new: true, runValidators: true }
    );
    if (!service) throw new Error("Service not found");
    return service;
  }

  async deleteService(serviceId) {
    const service = await Service.findByIdAndUpdate(
      serviceId,
      { status: "not-available" },
      { new: true }
    );
    if (!service) throw new Error("Service not found");
    return service;
  }

  /* ========== CLIENT ========== */
  async getAllServices() {
    return Service.find({ status: "available" }).sort({ createdAt: -1 });
  }

  async getService(serviceId) {
    const service = await Service.findById(serviceId);
    if (!service || service.status !== "available")
      throw new Error("Service not found");
    return service;
  }

  /* ========== JOB INTEGRATION ========== */
  async validateServiceForJob(serviceId) {
    const service = await Service.findById(serviceId);
    if (!service) throw new Error("Service not found");
    if (service.status !== "available")
      throw new Error("Service is not available");
    return service;
  }

  async incrementBookingCount(serviceId) {
    await Service.findByIdAndUpdate(serviceId, {
      $inc: { booking_count: 1 },
    });
  }

  /* ========== SEARCH ========== */
  async searchServices(query, limit = 20) {
    return Service.find(
      {
        $text: { $search: query },
        status: "available",
      },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(Number(limit));
  }

  async autocomplete(query, limit = 5) {
    const regex = new RegExp(query, "i");
    return Service.find({
      $or: [{ name: regex }, { category: regex }],
      status: "available",
    })
      .select("name category")
      .limit(limit);
  }
}

module.exports = new ServiceService();
