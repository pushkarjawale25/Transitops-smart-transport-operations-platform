const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    safetyScore: {
        type: Number,
        default: 100,
        min: 0,
        max: 100
    },
    status: {
        type: String,
        enum: ["Available", "On Trip", "Off Duty", "Suspended"],
        default: "Available"
    }
}, { timestamps: true });

driverSchema.virtual("isLicenseExpired").get(function () {
    return this.expiryDate < new Date();
});

module.exports = mongoose.model("Driver", driverSchema);
