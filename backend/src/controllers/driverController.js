const Driver = require("../models/Driver");

exports.getAllDrivers = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const drivers = await Driver.find(filter).sort({ createdAt: -1 });

        const driversWithExpiry = drivers.map(d => ({
            ...d.toObject(),
            isLicenseExpired: d.expiryDate < new Date()
        }));

        res.json({ success: true, count: drivers.length, drivers: driversWithExpiry });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getDriverById = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ success: false, message: "Driver not found." });
        }
        res.json({
            success: true,
            driver: { ...driver.toObject(), isLicenseExpired: driver.expiryDate < new Date() }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createDriver = async (req, res) => {
    try {
        const { name, licenseNumber, expiryDate, phone, safetyScore } = req.body;

        const existing = await Driver.findOne({ licenseNumber });
        if (existing) {
            return res.status(400).json({ success: false, message: "License number already registered." });
        }

        const driver = await Driver.create({ name, licenseNumber, expiryDate, phone, safetyScore });
        res.status(201).json({ success: true, driver });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateDriver = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ success: false, message: "Driver not found." });
        }

        const updated = await Driver.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, driver: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.suspendDriver = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ success: false, message: "Driver not found." });
        }

        if (driver.status === "On Trip") {
            return res.status(400).json({ success: false, message: "Cannot suspend a driver currently on a trip." });
        }

        driver.status = "Suspended";
        await driver.save();

        res.json({ success: true, message: "Driver suspended.", driver });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.reactivateDriver = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ success: false, message: "Driver not found." });
        }

        driver.status = "Available";
        await driver.save();

        res.json({ success: true, message: "Driver reactivated.", driver });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.renewLicense = async (req, res) => {
    try {
        const { expiryDate } = req.body;
        if (!expiryDate) {
            return res.status(400).json({ success: false, message: "New expiry date is required." });
        }

        const driver = await Driver.findByIdAndUpdate(
            req.params.id,
            { expiryDate },
            { new: true, runValidators: true }
        );

        if (!driver) {
            return res.status(404).json({ success: false, message: "Driver not found." });
        }

        res.json({ success: true, message: "License renewed.", driver });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteDriver = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ success: false, message: "Driver not found." });
        }

        if (driver.status === "On Trip") {
            return res.status(400).json({ success: false, message: "Cannot delete a driver currently on a trip." });
        }

        await Driver.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Driver deleted successfully." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
