const express = require("express");
const router = express.Router();
const {
    getAllTrips,
    getTripById,
    createTrip,
    dispatchTrip,
    completeTrip,
    cancelTrip
} = require("../controllers/tripController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.get("/", protect, getAllTrips);
router.get("/:id", protect, getTripById);
router.post("/", protect, authorize("Admin", "Fleet Manager"), createTrip);
router.patch("/:id/dispatch", protect, authorize("Admin", "Fleet Manager"), dispatchTrip);
router.patch("/:id/complete", protect, authorize("Admin", "Fleet Manager", "Driver"), completeTrip);
router.patch("/:id/cancel", protect, authorize("Admin", "Fleet Manager"), cancelTrip);

module.exports = router;
