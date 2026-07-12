const express = require("express");
const router = express.Router();
const {
    getAllMaintenance,
    getMaintenanceById,
    createMaintenance,
    closeMaintenance
} = require("../controllers/maintenanceController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.get("/", protect, getAllMaintenance);
router.get("/:id", protect, getMaintenanceById);
router.post("/", protect, authorize("Admin", "Fleet Manager"), createMaintenance);
router.patch("/:id/close", protect, authorize("Admin", "Fleet Manager"), closeMaintenance);

module.exports = router;
