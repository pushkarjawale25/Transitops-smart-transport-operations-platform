const { calculateDashboardMetrics } = require("../utils/calculateMetrics");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const Trip = require("../models/Trip");
const FuelLog = require("../models/FuelLog");
const Maintenance = require("../models/Maintenance");
const Expense = require("../models/Expense");

exports.getDashboard = async (req, res) => {
    try {
        const metrics = await calculateDashboardMetrics();

        const expiredLicenses = await Driver.countDocuments({
            expiryDate: { $lt: new Date() },
            status: { $ne: "Suspended" }
        });

        const recentTrips = await Trip.find()
            .populate("vehicle", "registrationNumber vehicleName")
            .populate("driver", "name")
            .sort({ createdAt: -1 })
            .limit(5);

        const recentMaintenance = await Maintenance.find({ status: "Open" })
            .populate("vehicle", "registrationNumber vehicleName")
            .sort({ createdAt: -1 })
            .limit(5);

        const vehicleStatusBreakdown = await Vehicle.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const tripStatusBreakdown = await Trip.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            metrics: { ...metrics, expiredLicenses },
            recentTrips,
            recentMaintenance,
            vehicleStatusBreakdown,
            tripStatusBreakdown
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getReports = async (req, res) => {
    try {
        const vehicles = await Vehicle.find();

        const vehicleReports = await Promise.all(
            vehicles.map(async (vehicle) => {
                const [fuelLogs, maintenanceLogs, expenses, trips] = await Promise.all([
                    FuelLog.find({ vehicle: vehicle._id }),
                    Maintenance.find({ vehicle: vehicle._id }),
                    Expense.find({ vehicle: vehicle._id }),
                    Trip.find({ vehicle: vehicle._id, status: "Completed" })
                ]);

                const fuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
                const maintenanceCost = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
                const expenseCost = expenses.reduce((sum, e) => sum + e.amount, 0);
                const totalCost = fuelCost + maintenanceCost + expenseCost;
                const totalDistance = trips.reduce((sum, t) => sum + (t.actualDistance || 0), 0);
                const totalFuelLiters = fuelLogs.reduce((sum, f) => sum + f.liters, 0);
                const fuelEfficiency = totalFuelLiters > 0
                    ? Number((totalDistance / totalFuelLiters).toFixed(2))
                    : 0;
                const roi = vehicle.acquisitionCost > 0
                    ? Number((((totalDistance * 50) - maintenanceCost - fuelCost) / vehicle.acquisitionCost * 100).toFixed(2))
                    : 0;

                return {
                    vehicleId: vehicle._id,
                    registrationNumber: vehicle.registrationNumber,
                    vehicleName: vehicle.vehicleName,
                    type: vehicle.type,
                    status: vehicle.status,
                    acquisitionCost: vehicle.acquisitionCost,
                    totalTrips: trips.length,
                    totalDistance,
                    fuelCost,
                    maintenanceCost,
                    expenseCost,
                    totalCost,
                    totalFuelLiters,
                    fuelEfficiency,
                    roi
                };
            })
        );

        const totalFuelCost = vehicleReports.reduce((sum, v) => sum + v.fuelCost, 0);
        const totalMaintenanceCost = vehicleReports.reduce((sum, v) => sum + v.maintenanceCost, 0);
        const totalExpenseCost = vehicleReports.reduce((sum, v) => sum + v.expenseCost, 0);
        const totalOperationalCost = totalFuelCost + totalMaintenanceCost + totalExpenseCost;

        res.json({
            success: true,
            summary: {
                totalVehicles: vehicles.length,
                totalFuelCost,
                totalMaintenanceCost,
                totalExpenseCost,
                totalOperationalCost
            },
            vehicleReports
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.exportCSV = async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        const rows = ["Registration Number,Vehicle Name,Type,Status,Acquisition Cost,Fuel Cost,Maintenance Cost,Expense Cost,Total Cost"];

        for (const vehicle of vehicles) {
            const [fuelLogs, maintenanceLogs, expenses] = await Promise.all([
                FuelLog.find({ vehicle: vehicle._id }),
                Maintenance.find({ vehicle: vehicle._id }),
                Expense.find({ vehicle: vehicle._id })
            ]);

            const fuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
            const maintenanceCost = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
            const expenseCost = expenses.reduce((sum, e) => sum + e.amount, 0);
            const totalCost = fuelCost + maintenanceCost + expenseCost;

            rows.push(`${vehicle.registrationNumber},${vehicle.vehicleName},${vehicle.type},${vehicle.status},${vehicle.acquisitionCost},${fuelCost},${maintenanceCost},${expenseCost},${totalCost}`);
        }

        const csv = rows.join("\n");
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=transitops-report.csv");
        res.send(csv);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
