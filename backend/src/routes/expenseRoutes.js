const express = require("express");
const router = express.Router();
const {
    getAllExpenses,
    addExpense,
    deleteExpense
} = require("../controllers/expenseController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

const expenseRoles = ["Admin", "Fleet Manager", "Financial Analyst"];

router.get("/", protect, authorize(...expenseRoles), getAllExpenses);
router.post("/", protect, authorize("Admin", "Fleet Manager"), addExpense);
router.delete("/:id", protect, authorize("Admin", "Fleet Manager"), deleteExpense);

module.exports = router;
