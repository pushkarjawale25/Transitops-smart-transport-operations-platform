const express = require("express");
const router = express.Router();
const {
    getAllFuelLogs,
    addFuelLog,
    deleteFuelLog
} = require("../controllers/fuelController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

const fuelRoles = ["Admin", "Fleet Manager", "Financial Analyst"];

router.get("/", protect, authorize(...fuelRoles), getAllFuelLogs);
router.post("/", protect, authorize("Admin", "Fleet Manager"), addFuelLog);
router.delete("/:id", protect, authorize("Admin", "Fleet Manager"), deleteFuelLog);

module.exports = router;
