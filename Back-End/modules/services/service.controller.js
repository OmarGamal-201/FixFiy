const serviceService = require("./service.service");

/* ===== ADMIN ===== */
exports.addService = async (req, res) => {
  try {
    const service = await serviceService.addService(
      req.body,
      req.user.id
    );
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await serviceService.updateService(id, req.body);
    res.json({ success: true, data: service });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await serviceService.deleteService(id);
    res.json({ success: true, message: "Service disabled" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ===== CLIENT ===== */
exports.getAllServices = async (req, res) => {
  try {
    const services = await serviceService.getAllServices();
    res.json({ success: true, data: services });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await serviceService.getService(id);
    res.json({ success: true, data: service });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

/* ===== SEARCH ===== */
exports.search = async (req, res) => {
  try {
    const { q, limit } = req.query;
    const results = await serviceService.searchServices(q, limit);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.autocomplete = async (req, res) => {
  try {
    const { q, limit } = req.query;
    const results = await serviceService.autocomplete(q, limit);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
