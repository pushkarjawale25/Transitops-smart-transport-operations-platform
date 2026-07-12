const User = require("../models/user");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const Trip = require("../models/Trip");
const Maintenance = require("../models/Maintenance");
const FuelLog = require("../models/FuelLog");
const Expense = require("../models/Expense");

const users = [
    { name: "System Admin", email: "admin@transitops.com", password: "Admin@123", role: "Admin" },
    { name: "Alex Fleet", email: "fleet@transitops.com", password: "Fleet@123", role: "Fleet Manager" },
    { name: "Seema Kulkarni", email: "dispatcher@transitops.com", password: "Dispatcher@123", role: "Dispatcher" },
    { name: "Sarah Safety", email: "safety@transitops.com", password: "Safety@123", role: "Safety Officer" },
    { name: "Frank Finance", email: "finance@transitops.com", password: "Finance@123", role: "Financial Analyst" },
    { name: "Vijay Singh", email: "driver@transitops.com", password: "Driver@123", role: "Driver" }
];

const mockVehicles = [
    { localId: "v1", registrationNumber: "MH12AB4589", vehicleName: "Tata Ace Gold", type: "Truck", capacity: 750, odometer: 98000, acquisitionCost: 550000, status: "Available", region: "West" },
    { localId: "v2", registrationNumber: "MH14CX9021", vehicleName: "Tata Intra V50", type: "Truck", capacity: 1700, odometer: 76000, acquisitionCost: 875000, status: "On Trip", region: "West" },
    { localId: "v3", registrationNumber: "MH43DF7812", vehicleName: "Tata 407 Gold", type: "Truck", capacity: 2500, odometer: 112000, acquisitionCost: 1250000, status: "In Shop", region: "West" },
    { localId: "v4", registrationNumber: "KA01MN4421", vehicleName: "Mahindra Supro Maxitruck", type: "Truck", capacity: 1700, odometer: 54000, acquisitionCost: 750000, status: "Available", region: "South" },
    { localId: "v5", registrationNumber: "DL01TR9874", vehicleName: "Ashok Leyland Dost+", type: "Truck", capacity: 2500, odometer: 82000, acquisitionCost: 850000, status: "On Trip", region: "North" },
    { localId: "v6", registrationNumber: "GJ05RT6543", vehicleName: "Eicher Pro 2049", type: "Truck", capacity: 4900, odometer: 103000, acquisitionCost: 1800000, status: "Available", region: "West" },
    { localId: "v7", registrationNumber: "MH12CK3390", vehicleName: "BharatBenz 1217R", type: "Truck", capacity: 7200, odometer: 94000, acquisitionCost: 3200000, status: "Available", region: "West" },
    { localId: "v8", registrationNumber: "KA02XY1234", vehicleName: "Tata Signa 3118", type: "Truck", capacity: 18000, odometer: 148000, acquisitionCost: 4500000, status: "In Shop", region: "South" },
    { localId: "v9", registrationNumber: "DL05GH5678", vehicleName: "Ashok Leyland 2820", type: "Truck", capacity: 18000, odometer: 135000, acquisitionCost: 3200000, status: "Available", region: "North" },
    { localId: "v10", registrationNumber: "RJ14PQ5678", vehicleName: "Eicher Pro 3015", type: "Truck", capacity: 17000, odometer: 126000, acquisitionCost: 3200000, status: "On Trip", region: "North" }
];

const mockDrivers = [
    { localId: "d1", name: "Ramesh Patil", licenseNumber: "MH12-202345", licenseCategory: "C+E", expiryDate: new Date("2027-08-09"), phone: "+91 9876543210", safetyScore: 92, status: "Available" },
    { localId: "d2", name: "Suresh Shinde", licenseNumber: "MH14-203456", licenseCategory: "C", expiryDate: new Date("2026-11-12"), phone: "+91 9823456789", safetyScore: 88, status: "On Trip" },
    { localId: "d3", name: "Mahesh Pawar", licenseNumber: "MH43-204567", licenseCategory: "C+E", expiryDate: new Date("2028-01-25"), phone: "+91 9765432109", safetyScore: 90, status: "Available" },
    { localId: "d4", name: "Amit Jadhav", licenseNumber: "KA01-205678", licenseCategory: "C", expiryDate: new Date("2026-09-30"), phone: "+91 9956123450", safetyScore: 85, status: "Off Duty" },
    { localId: "d5", name: "Rahul Chavan", licenseNumber: "DL01-206789", licenseCategory: "C", expiryDate: new Date("2026-12-05"), phone: "+91 9887766554", safetyScore: 83, status: "Available" },
    { localId: "d6", name: "Ganesh More", licenseNumber: "GJ05-207890", licenseCategory: "C+E", expiryDate: new Date("2027-04-15"), phone: "+91 9812345670", safetyScore: 89, status: "Available" },
    { localId: "d7", name: "Santosh Kadam", licenseNumber: "MH12-208901", licenseCategory: "C", expiryDate: new Date("2026-10-18"), phone: "+91 9898989898", safetyScore: 87, status: "On Trip" },
    { localId: "d8", name: "Pravin Deshmukh", licenseNumber: "GJ05-209012", licenseCategory: "C+E", expiryDate: new Date("2028-05-20"), phone: "+91 9765123487", safetyScore: 94, status: "Available" },
    { localId: "d9", name: "Vijay Yadav", licenseNumber: "RJ14-210123", licenseCategory: "C", expiryDate: new Date("2027-02-05"), phone: "+91 9922334455", safetyScore: 91, status: "Off Duty" },
    { localId: "d10", name: "Sunil Sharma", licenseNumber: "TN01-211234", licenseCategory: "C", expiryDate: new Date("2026-08-14"), phone: "+91 9871234560", safetyScore: 88, status: "Available" },
    { localId: "d11", name: "Akash Verma", licenseNumber: "MP09-212345", licenseCategory: "C+E", expiryDate: new Date("2027-03-22"), phone: "+91 9865432190", safetyScore: 86, status: "Available" },
    { localId: "d12", name: "Nitin Gupta", licenseNumber: "DL05-213456", licenseCategory: "C", expiryDate: new Date("2027-05-10"), phone: "+91 9815566778", safetyScore: 84, status: "On Trip" },
    { localId: "d13", name: "Rajesh Singh", licenseNumber: "HR26-214567", licenseCategory: "C", expiryDate: new Date("2028-06-30"), phone: "+91 9870987654", safetyScore: 79, status: "Available" },
    { localId: "d14", name: "Manoj Kumar", licenseNumber: "UP32-215678", licenseCategory: "C+E", expiryDate: new Date("2027-12-18"), phone: "+91 9900112233", safetyScore: 92, status: "Available" },
    { localId: "d15", name: "Deepak Joshi", licenseNumber: "TN07-216789", licenseCategory: "C", expiryDate: new Date("2026-09-28"), phone: "+91 9797979797", safetyScore: 82, status: "Suspended" }
];

const mockTrips = [
    { source: "Pune", destination: "Mumbai", vehicleLocalId: "v1", driverLocalId: "d1", cargoWeight: 650, plannedDistance: 150, revenue: 85000, dispatchDate: new Date("2026-07-10"), status: "Dispatched" },
    { source: "Mumbai", destination: "Nashik", vehicleLocalId: "v2", driverLocalId: "d2", cargoWeight: 1600, plannedDistance: 165, revenue: 92000, dispatchDate: new Date("2026-07-11"), status: "Dispatched" },
    { source: "Pune", destination: "Hyderabad", vehicleLocalId: "v4", driverLocalId: "d4", cargoWeight: 1500, plannedDistance: 560, revenue: 240000, dispatchDate: new Date("2026-07-12"), status: "Dispatched" },
    { source: "Nagpur", destination: "Indore", vehicleLocalId: "v6", driverLocalId: "d6", cargoWeight: 4700, plannedDistance: 450, revenue: 360000, dispatchDate: new Date("2026-07-05"), status: "Completed", actualDistance: 450, fuelConsumed: 95 },
    { source: "Bengaluru", destination: "Chennai", vehicleLocalId: "v5", driverLocalId: "d5", cargoWeight: 2200, plannedDistance: 350, revenue: 310000, dispatchDate: new Date("2026-07-06"), status: "Completed", actualDistance: 350, fuelConsumed: 78 },
    { source: "Ahmedabad", destination: "Surat", vehicleLocalId: "v8", driverLocalId: "d7", cargoWeight: 5600, plannedDistance: 270, revenue: 135000, dispatchDate: new Date("2026-07-14"), status: "Draft" },
    { source: "Delhi", destination: "Jaipur", vehicleLocalId: "v9", driverLocalId: "d10", cargoWeight: 17200, plannedDistance: 280, revenue: 325000, dispatchDate: new Date("2026-07-08"), status: "Cancelled" },
    { source: "Mumbai", destination: "Bengaluru", vehicleLocalId: "v10", driverLocalId: "d12", cargoWeight: 14500, plannedDistance: 980, revenue: 620000, dispatchDate: new Date("2026-07-09"), status: "Dispatched" },
    { source: "Hyderabad", destination: "Chennai", vehicleLocalId: "v3", driverLocalId: "d3", cargoWeight: 2200, plannedDistance: 625, revenue: 248000, dispatchDate: new Date("2026-07-13"), status: "Draft" },
    { source: "Delhi", destination: "Chandigarh", vehicleLocalId: "v9", driverLocalId: "d13", cargoWeight: 3500, plannedDistance: 250, revenue: 95000, dispatchDate: new Date("2026-07-13"), status: "Draft" }
];

const mockMaintenance = [
    { vehicleLocalId: "v3", maintenanceType: "Oil Change", description: "Engine oil change and filter replacement", cost: 4500, date: new Date("2026-07-09"), status: "Open" },
    { vehicleLocalId: "v8", maintenanceType: "Brake Repair", description: "Brake system overhaul and alignment", cost: 18000, date: new Date("2026-07-07"), status: "Open" },
    { vehicleLocalId: "v1", maintenanceType: "General Service", description: "Annual safety inspection and paperwork", cost: 2500, date: new Date("2026-06-20"), closedAt: new Date("2026-06-21"), status: "Closed" },
    { vehicleLocalId: "v5", maintenanceType: "Other", description: "Vehicle wash and tire rotation", cost: 300, date: new Date("2026-06-15"), closedAt: new Date("2026-06-15"), status: "Closed" },
    { vehicleLocalId: "v4", maintenanceType: "Battery Replacement", description: "Replaced old battery", cost: 6500, date: new Date("2026-06-18"), closedAt: new Date("2026-06-18"), status: "Closed" },
    { vehicleLocalId: "v2", maintenanceType: "Tyre Change", description: "Front tyre replaced", cost: 12000, date: new Date("2026-07-02"), closedAt: new Date("2026-07-02"), status: "Closed" },
    { vehicleLocalId: "v6", maintenanceType: "Brake Repair", description: "Rear brake pads replaced", cost: 8000, date: new Date("2026-07-04"), closedAt: new Date("2026-07-04"), status: "Closed" },
    { vehicleLocalId: "v7", maintenanceType: "General Service", description: "Second free service", cost: 0, date: new Date("2026-07-01"), closedAt: new Date("2026-07-01"), status: "Closed" },
    { vehicleLocalId: "v9", maintenanceType: "Oil Change", description: "Engine oil top-up", cost: 1500, date: new Date("2026-07-06"), closedAt: new Date("2026-07-06"), status: "Closed" },
    { vehicleLocalId: "v10", maintenanceType: "Other", description: "Air conditioning repair", cost: 4200, date: new Date("2026-07-12"), status: "Open" }
];

const mockFuelLogs = [
    { vehicleLocalId: "v1", liters: 60, cost: 5760, date: new Date("2026-07-01"), odometerKm: 98000 },
    { vehicleLocalId: "v2", liters: 120, cost: 11520, date: new Date("2026-07-03"), odometerKm: 76000 },
    { vehicleLocalId: "v5", liters: 210, cost: 20160, date: new Date("2026-07-05"), odometerKm: 82000 },
    { vehicleLocalId: "v6", liters: 175, cost: 16800, date: new Date("2026-07-06"), odometerKm: 103000 },
    { vehicleLocalId: "v9", liters: 250, cost: 24000, date: new Date("2026-07-08"), odometerKm: 135000 },
    { vehicleLocalId: "v1", liters: 65, cost: 6240, date: new Date("2026-07-10"), odometerKm: 98250 },
    { vehicleLocalId: "v10", liters: 80, cost: 7680, date: new Date("2026-07-11"), odometerKm: 126000 },
    { vehicleLocalId: "v4", liters: 45, cost: 4320, date: new Date("2026-07-02"), odometerKm: 54000 },
    { vehicleLocalId: "v7", liters: 90, cost: 8640, date: new Date("2026-07-05"), odometerKm: 94000 },
    { vehicleLocalId: "v8", liters: 300, cost: 28800, date: new Date("2026-07-07"), odometerKm: 148000 }
];

const mockExpenses = [
    { category: "Other", amount: 5760, description: "Diesel refill - MH12AB4589", date: new Date("2026-07-01"), vehicleLocalId: "v1" },
    { category: "Toll", amount: 850, description: "Mumbai-Pune toll", date: new Date("2026-07-10"), vehicleLocalId: "v1" },
    { category: "Repair", amount: 4500, description: "Oil change - MH14CX9021", date: new Date("2026-07-09"), vehicleLocalId: "v3" },
    { category: "Other", amount: 500, description: "Driver allowance - Ramesh Patil", date: new Date("2026-07-04"), vehicleLocalId: "v1" },
    { category: "Other", amount: 11520, description: "Diesel refill - MH43DF7812", date: new Date("2026-07-03"), vehicleLocalId: "v2" },
    { category: "Toll", amount: 850, description: "Nagpur-Indore toll", date: new Date("2026-07-11"), vehicleLocalId: "v6" },
    { category: "Repair", amount: 18000, description: "Brake overhaul - KA01MN4421", date: new Date("2026-07-07"), vehicleLocalId: "v8" },
    { category: "Repair", amount: 300, description: "Vehicle wash - DL01TR9874", date: new Date("2026-07-06"), vehicleLocalId: "v5" },
    { category: "Repair", amount: 2500, description: "Minor repair - GJ05RT6543", date: new Date("2026-07-09"), vehicleLocalId: "v6" },
    { category: "Repair", amount: 18000, description: "Tyre replacement - RJ14PQ5678", date: new Date("2026-07-12"), vehicleLocalId: "v9" }
];

const seedAll = async () => {
    try {
        console.log("Checking database state for seeding...");

        // 1. Seed Users if not present
        const fleetManagerExists = await User.findOne({ email: "fleet@transitops.com" });
        if (!fleetManagerExists) {
            console.log("Fleet Manager user missing. Seeding default users...");
            for (const u of users) {
                const exists = await User.findOne({ email: u.email });
                if (!exists) {
                    await User.create(u);
                    console.log(`Created user: ${u.email}`);
                }
            }
        } else {
            console.log("Default users already present.");
        }

        const adminUser = await User.findOne({ role: "Admin" }) || await User.findOne();

        // 2. Seed operational collections if vehicles are empty
        const vehicleCount = await Vehicle.countDocuments();
        if (vehicleCount === 0) {
            console.log("Operational records are empty. Seeding TransitOps demo dataset...");

            // Seed Vehicles
            const vehicleMap = {};
            for (const v of mockVehicles) {
                const { localId, ...rest } = v;
                const vehicle = await Vehicle.create(rest);
                vehicleMap[localId] = vehicle._id;
            }
            console.log(`Seeded ${Object.keys(vehicleMap).length} vehicles.`);

            // Seed Drivers
            const driverMap = {};
            for (const d of mockDrivers) {
                const { localId, ...rest } = d;
                const driver = await Driver.create(rest);
                driverMap[localId] = driver._id;
            }
            console.log(`Seeded ${Object.keys(driverMap).length} drivers.`);

            // Seed Trips
            let tripCount = 0;
            for (const t of mockTrips) {
                await Trip.create({
                    source: t.source,
                    destination: t.destination,
                    vehicle: vehicleMap[t.vehicleLocalId],
                    driver: driverMap[t.driverLocalId],
                    cargoWeight: t.cargoWeight,
                    plannedDistance: t.plannedDistance,
                    actualDistance: t.actualDistance || 0,
                    fuelConsumed: t.fuelConsumed || 0,
                    revenue: t.revenue,
                    dispatchDate: t.dispatchDate,
                    status: t.status,
                    createdBy: adminUser._id
                });
                tripCount++;
            }
            console.log(`Seeded ${tripCount} trips.`);

            // Seed Maintenance
            let maintenanceCount = 0;
            for (const m of mockMaintenance) {
                await Maintenance.create({
                    vehicle: vehicleMap[m.vehicleLocalId],
                    maintenanceType: m.maintenanceType,
                    description: m.description,
                    cost: m.cost,
                    date: m.date,
                    closedAt: m.closedAt,
                    status: m.status
                });
                maintenanceCount++;
            }
            console.log(`Seeded ${maintenanceCount} maintenance logs.`);

            // Seed Fuel Logs
            let fuelCount = 0;
            for (const f of mockFuelLogs) {
                await FuelLog.create({
                    vehicle: vehicleMap[f.vehicleLocalId],
                    liters: f.liters,
                    cost: f.cost,
                    date: f.date,
                    odometerKm: f.odometerKm,
                    addedBy: adminUser._id
                });
                fuelCount++;
            }
            console.log(`Seeded ${fuelCount} fuel logs.`);

            // Seed Expenses
            let expenseCount = 0;
            for (const e of mockExpenses) {
                await Expense.create({
                    vehicle: vehicleMap[e.vehicleLocalId],
                    category: e.category,
                    amount: e.amount,
                    description: e.description,
                    date: e.date,
                    addedBy: adminUser._id
                });
                expenseCount++;
            }
            console.log(`Seeded ${expenseCount} expenses.`);
            console.log("Database Seeding Completed Successfully.");
        } else {
            console.log("Operational database records already exist. Skipping demo data seed.");
        }
    } catch (error) {
        console.error("Error Seeding Database:", error);
    }
};

module.exports = seedAll;
