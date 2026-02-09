const service = require("./technicianService.service");

/* =========================
   TECHNICIAN
========================= */

exports.addTechnicianService = async (req, res) => {
  try {
    const { serviceId, price, duration_minutes } = req.body;

    const techService = await service.addService({
      technicianId: req.user.id,
      serviceId,
      price,
      duration_minutes,
    });

    res.status(201).json({
      success: true,
      message: "Service added successfully",
      data: techService,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateTechnicianService = async (req, res) => {
  try {
    const updated = await service.updateService(
      req.params.id,
      req.user.id,
      req.body
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteTechnicianService = async (req, res) => {
  try {
    const result = await service.deleteService(
      req.params.id,
      req.user.id
    );

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getMyServices = async (req, res) => {
  try {
    const services = await service.getMyServices(req.user.id);
    res.json({ success: true, data: services });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* =========================
   CLIENT – MATCHING
========================= */

exports.getTechniciansForService = async (req, res) => {
  try {
    const technicians = await service.getTechniciansForService(
      req.params.serviceId
    );

    res.json({ success: true, data: technicians });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
