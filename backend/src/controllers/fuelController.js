const FuelLog = require("../models/FuelLog");
const Vehicle = require("../models/Vehicle");

exports.getAllFuelLogs = async (req, res) => {
    try {
        const { vehicle } = req.query;
        const filter = {};
        if (vehicle) filter.vehicle = vehicle;

        const logs = await FuelLog.find(filter)
            .populate("vehicle", "registrationNumber vehicleName")
            .populate("addedBy", "name role")
            .sort({ date: -1 });

        const totalCost = logs.reduce((sum, l) => sum + l.cost, 0);
        const totalLiters = logs.reduce((sum, l) => sum + l.liters, 0);

        res.json({ success: true, count: logs.length, totalCost, totalLiters, logs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addFuelLog = async (req, res) => {
    try {
        const { vehicle: vehicleId, liters, cost, date } = req.body;

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: "Vehicle not found." });
        }

        const log = await FuelLog.create({
            vehicle: vehicleId,
            liters,
            cost,
            date,
            addedBy: req.user._id
        });

        const populated = await FuelLog.findById(log._id)
            .populate("vehicle", "registrationNumber vehicleName");

        res.status(201).json({ success: true, fuelLog: populated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteFuelLog = async (req, res) => {
    try {
        const log = await FuelLog.findByIdAndDelete(req.params.id);
        if (!log) {
            return res.status(404).json({ success: false, message: "Fuel log not found." });
        }
        res.json({ success: true, message: "Fuel log deleted." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
