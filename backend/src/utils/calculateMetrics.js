const Vehicle = require("../models/Vehicle");
const Trip = require("../models/Trip");
const Driver = require("../models/Driver");
const FuelLog = require("../models/FuelLog");
const Maintenance = require("../models/Maintenance");
const Expense = require("../models/Expense");

const calculateDashboardMetrics = async () => {
    const [vehicles, trips, drivers, fuelLogs, maintenanceLogs, expenses] = await Promise.all([
        Vehicle.find(),
        Trip.find(),
        Driver.find(),
        FuelLog.find(),
        Maintenance.find(),
        Expense.find()
    ]);

    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.status === "Available").length;
    const activeVehicles = vehicles.filter(v => v.status !== "Retired").length;
    const maintenanceVehicles = vehicles.filter(v => v.status === "In Shop").length;
    const vehiclesOnTrip = vehicles.filter(v => v.status === "On Trip").length;

    const activeTrips = trips.filter(t => t.status === "Dispatched").length;
    const pendingTrips = trips.filter(t => t.status === "Draft").length;

    const driversOnDuty = drivers.filter(d => d.status === "On Trip").length;
    const driversAvailable = drivers.filter(d => d.status === "Available").length;

    const fuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
    const maintenanceCost = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
    const expenseCost = expenses.reduce((sum, e) => sum + e.amount, 0);
    const operationalCost = fuelCost + maintenanceCost + expenseCost;

    const fleetUtilization = totalVehicles > 0
        ? Math.round((vehiclesOnTrip / totalVehicles) * 100)
        : 0;

    return {
        totalVehicles,
        activeVehicles,
        availableVehicles,
        maintenanceVehicles,
        vehiclesOnTrip,
        activeTrips,
        pendingTrips,
        driversOnDuty,
        driversAvailable,
        fleetUtilization,
        fuelCost,
        maintenanceCost,
        expenseCost,
        operationalCost
    };
};

const getVehicleCostSummary = async (vehicleId) => {
    const [fuelLogs, maintenanceLogs, expenses] = await Promise.all([
        FuelLog.find({ vehicle: vehicleId }),
        Maintenance.find({ vehicle: vehicleId }),
        Expense.find({ vehicle: vehicleId })
    ]);

    const fuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
    const maintenanceCost = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
    const expenseCost = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalCost = fuelCost + maintenanceCost + expenseCost;

    return { fuelCost, maintenanceCost, expenseCost, totalCost };
};

module.exports = { calculateDashboardMetrics, getVehicleCostSummary };
