const Maintenance = require("../models/Maintenance");
const Vehicle = require("../models/Vehicle");

exports.getAllMaintenance = async (req, res) => {
    try {
        const { status, vehicle } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (vehicle) filter.vehicle = vehicle;

        const records = await Maintenance.find(filter)
            .populate("vehicle", "registrationNumber vehicleName")
            .sort({ createdAt: -1 });

        res.json({ success: true, count: records.length, maintenance: records });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getMaintenanceById = async (req, res) => {
    try {
        const record = await Maintenance.findById(req.params.id)
            .populate("vehicle", "registrationNumber vehicleName");

        if (!record) {
            return res.status(404).json({ success: false, message: "Maintenance record not found." });
        }

        res.json({ success: true, maintenance: record });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createMaintenance = async (req, res) => {
    try {
        const { vehicle: vehicleId, maintenanceType, description, cost, date } = req.body;

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: "Vehicle not found." });
        }

        if (vehicle.status === "On Trip") {
            return res.status(400).json({ success: false, message: "Cannot schedule maintenance for a vehicle currently on a trip." });
        }

        if (vehicle.status === "Retired") {
            return res.status(400).json({ success: false, message: "Cannot schedule maintenance for a retired vehicle." });
        }

        const maintenance = await Maintenance.create({
            vehicle: vehicleId,
            maintenanceType,
            description,
            cost,
            date
        });

        await Vehicle.findByIdAndUpdate(vehicleId, { status: "In Shop" });

        const populated = await Maintenance.findById(maintenance._id)
            .populate("vehicle", "registrationNumber vehicleName");

        res.status(201).json({ success: true, message: "Maintenance opened. Vehicle status set to In Shop.", maintenance: populated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.closeMaintenance = async (req, res) => {
    try {
        const record = await Maintenance.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ success: false, message: "Maintenance record not found." });
        }

        if (record.status === "Closed") {
            return res.status(400).json({ success: false, message: "Maintenance is already closed." });
        }

        await Promise.all([
            Maintenance.findByIdAndUpdate(record._id, { status: "Closed", closedAt: new Date() }),
            Vehicle.findByIdAndUpdate(record.vehicle, { status: "Available" })
        ]);

        res.json({ success: true, message: "Maintenance closed. Vehicle is now Available." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
