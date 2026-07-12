const express = require("express");
const router = express.Router();
const {
    getAllDrivers,
    getDriverById,
    createDriver,
    updateDriver,
    suspendDriver,
    reactivateDriver,
    renewLicense,
    deleteDriver
} = require("../controllers/driverController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

const driverManagementRoles = ["Admin", "Fleet Manager", "Safety Officer"];

router.get("/", protect, getAllDrivers);
router.get("/:id", protect, getDriverById);
router.post("/", protect, authorize(...driverManagementRoles), createDriver);
router.put("/:id", protect, authorize(...driverManagementRoles), updateDriver);
router.patch("/:id/suspend", protect, authorize("Admin", "Safety Officer"), suspendDriver);
router.patch("/:id/reactivate", protect, authorize("Admin", "Safety Officer"), reactivateDriver);
router.patch("/:id/renew-license", protect, authorize("Admin", "Safety Officer"), renewLicense);
router.delete("/:id", protect, authorize(...driverManagementRoles), deleteDriver);

module.exports = router;
