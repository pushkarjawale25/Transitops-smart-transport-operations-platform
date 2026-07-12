const Trip = require("../models/Trip");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");

exports.getAllTrips = async (req, res) => {
    try {
        const { status, vehicle, driver } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (vehicle) filter.vehicle = vehicle;
        if (driver) filter.driver = driver;

        const trips = await Trip.find(filter)
            .populate("vehicle", "registrationNumber vehicleName type")
            .populate("driver", "name licenseNumber phone")
            .populate("createdBy", "name email role")
            .sort({ createdAt: -1 });

        res.json({ success: true, count: trips.length, trips });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getTripById = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id)
            .populate("vehicle")
            .populate("driver")
            .populate("createdBy", "name email role");

        if (!trip) {
            return res.status(404).json({ success: false, message: "Trip not found." });
        }

        res.json({ success: true, trip });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createTrip = async (req, res) => {
    try {
        const { source, destination, vehicle: vehicleId, driver: driverId, cargoWeight, plannedDistance } = req.body;

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: "Vehicle not found." });
        }
        if (vehicle.status !== "Available") {
            return res.status(400).json({ success: false, message: `Vehicle is not available. Current status: ${vehicle.status}` });
        }

        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ success: false, message: "Driver not found." });
        }
        if (driver.status === "Suspended") {
            return res.status(400).json({ success: false, message: "Driver is suspended and cannot be assigned." });
        }
        if (driver.status !== "Available") {
            return res.status(400).json({ success: false, message: `Driver is not available. Current status: ${driver.status}` });
        }
        if (driver.expiryDate < new Date()) {
            return res.status(400).json({ success: false, message: "Driver's license is expired. Renew before assigning." });
        }

        if (cargoWeight > vehicle.capacity) {
            return res.status(400).json({
                success: false,
                message: `Cargo weight (${cargoWeight} kg) exceeds vehicle capacity (${vehicle.capacity} kg).`
            });
        }

        const trip = await Trip.create({
            source,
            destination,
            vehicle: vehicleId,
            driver: driverId,
            cargoWeight,
            plannedDistance,
            createdBy: req.user._id
        });

        const populated = await Trip.findById(trip._id)
            .populate("vehicle", "registrationNumber vehicleName type")
            .populate("driver", "name licenseNumber phone");

        res.status(201).json({ success: true, trip: populated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.dispatchTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ success: false, message: "Trip not found." });
        }
        if (trip.status !== "Draft") {
            return res.status(400).json({ success: false, message: `Trip cannot be dispatched. Current status: ${trip.status}` });
        }

        const vehicle = await Vehicle.findById(trip.vehicle);
        const driver = await Driver.findById(trip.driver);

        if (!vehicle || vehicle.status !== "Available") {
            return res.status(400).json({ success: false, message: "Vehicle is no longer available." });
        }
        if (!driver || driver.status !== "Available") {
            return res.status(400).json({ success: false, message: "Driver is no longer available." });
        }
        if (driver.expiryDate < new Date()) {
            return res.status(400).json({ success: false, message: "Driver's license has expired." });
        }

        await Promise.all([
            Trip.findByIdAndUpdate(trip._id, { status: "Dispatched", startTime: new Date() }),
            Vehicle.findByIdAndUpdate(trip.vehicle, { status: "On Trip" }),
            Driver.findByIdAndUpdate(trip.driver, { status: "On Trip" })
        ]);

        const updated = await Trip.findById(trip._id)
            .populate("vehicle", "registrationNumber vehicleName")
            .populate("driver", "name licenseNumber");

        res.json({ success: true, message: "Trip dispatched successfully.", trip: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.completeTrip = async (req, res) => {
    try {
        const { actualDistance, fuelConsumed } = req.body;

        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ success: false, message: "Trip not found." });
        }
        if (trip.status !== "Dispatched") {
            return res.status(400).json({ success: false, message: `Trip cannot be completed. Current status: ${trip.status}` });
        }

        const vehicle = await Vehicle.findById(trip.vehicle);
        const newOdometer = vehicle ? vehicle.odometer + (actualDistance || trip.plannedDistance) : undefined;

        await Promise.all([
            Trip.findByIdAndUpdate(trip._id, {
                status: "Completed",
                endTime: new Date(),
                actualDistance: actualDistance || trip.plannedDistance,
                fuelConsumed: fuelConsumed || 0
            }),
            Vehicle.findByIdAndUpdate(trip.vehicle, {
                status: "Available",
                ...(newOdometer !== undefined && { odometer: newOdometer })
            }),
            Driver.findByIdAndUpdate(trip.driver, { status: "Available" })
        ]);

        const updated = await Trip.findById(trip._id)
            .populate("vehicle", "registrationNumber vehicleName")
            .populate("driver", "name licenseNumber");

        res.json({ success: true, message: "Trip completed successfully.", trip: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.cancelTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ success: false, message: "Trip not found." });
        }
        if (!["Draft", "Dispatched"].includes(trip.status)) {
            return res.status(400).json({ success: false, message: `Trip cannot be cancelled. Current status: ${trip.status}` });
        }

        const updates = [Trip.findByIdAndUpdate(trip._id, { status: "Cancelled" })];

        if (trip.status === "Dispatched") {
            updates.push(Vehicle.findByIdAndUpdate(trip.vehicle, { status: "Available" }));
            updates.push(Driver.findByIdAndUpdate(trip.driver, { status: "Available" }));
        }

        await Promise.all(updates);

        res.json({ success: true, message: "Trip cancelled. Vehicle and driver restored to Available." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
