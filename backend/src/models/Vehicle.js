const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
    registrationNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    vehicleName: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ["Truck", "Van", "Bus", "Car", "Other"],
        required: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 0
    },
    odometer: {
        type: Number,
        default: 0,
        min: 0
    },
    acquisitionCost: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ["Available", "On Trip", "In Shop", "Retired"],
        default: "Available"
    }
}, { timestamps: true });

module.exports = mongoose.model("Vehicle", vehicleSchema);
