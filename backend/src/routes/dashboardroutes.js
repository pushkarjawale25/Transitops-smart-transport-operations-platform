const express = require("express");
const router = express.Router();
const { getDashboard, getReports, exportCSV } = require("../controllers/dashboardController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.get("/", protect, getDashboard);
router.get("/reports", protect, authorize("Admin", "Financial Analyst"), getReports);
router.get("/export/csv", protect, authorize("Admin", "Financial Analyst"), exportCSV);

module.exports = router;