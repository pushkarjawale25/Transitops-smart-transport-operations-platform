const Vehicle = require("../models/Vehicle");
const { getVehicleCostSummary } = require("../utils/calculateMetrics");

exports.getAllVehicles = async (req, res) => {
    try {
        const { status, type } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;

        const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, count: vehicles.length, vehicles });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: "Vehicle not found." });
        }

        const costSummary = await getVehicleCostSummary(vehicle._id);
        res.json({ success: true, vehicle, costSummary });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createVehicle = async (req, res) => {
    try {
        const { registrationNumber, vehicleName, type, capacity, odometer, acquisitionCost } = req.body;

        const existing = await Vehicle.findOne({ registrationNumber: registrationNumber.toUpperCase() });
        if (existing) {
            return res.status(400).json({ success: false, message: "Registration number already exists." });
        }

        const vehicle = await Vehicle.create({
            registrationNumber,
            vehicleName,
            type,
            capacity,
            odometer,
            acquisitionCost
        });

        res.status(201).json({ success: true, vehicle });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: "Vehicle not found." });
        }

        if (vehicle.status === "Retired") {
            return res.status(400).json({ success: false, message: "Cannot update a retired vehicle." });
        }

        const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, vehicle: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.retireVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: "Vehicle not found." });
        }

        if (vehicle.status === "On Trip") {
            return res.status(400).json({ success: false, message: "Cannot retire a vehicle that is currently on a trip." });
        }

        vehicle.status = "Retired";
        await vehicle.save();

        res.json({ success: true, message: "Vehicle retired successfully.", vehicle });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: "Vehicle not found." });
        }

        if (vehicle.status === "On Trip") {
            return res.status(400).json({ success: false, message: "Cannot delete a vehicle currently on a trip." });
        }

        await Vehicle.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Vehicle deleted successfully." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
