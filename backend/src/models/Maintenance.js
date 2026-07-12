const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true
    },
    maintenanceType: {
        type: String,
        enum: ["Oil Change", "Brake Repair", "Tyre Change", "Battery Replacement", "General Service", "Other"],
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    cost: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ["Open", "Closed"],
        default: "Open"
    },
    date: {
        type: Date,
        default: Date.now
    },
    closedAt: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model("Maintenance", maintenanceSchema);
