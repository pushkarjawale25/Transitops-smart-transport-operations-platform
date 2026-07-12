const express = require("express");
const router = express.Router();
const {
    getAllVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    retireVehicle,
    deleteVehicle
} = require("../controllers/vehicleController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

const fleetRoles = ["Admin", "Fleet Manager"];

router.get("/", protect, getAllVehicles);
router.get("/:id", protect, getVehicleById);
router.post("/", protect, authorize(...fleetRoles), createVehicle);
router.put("/:id", protect, authorize(...fleetRoles), updateVehicle);
router.patch("/:id/retire", protect, authorize(...fleetRoles), retireVehicle);
router.delete("/:id", protect, authorize(...fleetRoles), deleteVehicle);

module.exports = router;
