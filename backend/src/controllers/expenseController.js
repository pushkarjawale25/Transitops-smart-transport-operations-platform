const Expense = require("../models/Expense");
const Vehicle = require("../models/Vehicle");

exports.getAllExpenses = async (req, res) => {
    try {
        const { vehicle, category } = req.query;
        const filter = {};
        if (vehicle) filter.vehicle = vehicle;
        if (category) filter.category = category;

        const expenses = await Expense.find(filter)
            .populate("vehicle", "registrationNumber vehicleName")
            .populate("addedBy", "name role")
            .sort({ date: -1 });

        const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

        res.json({ success: true, count: expenses.length, totalAmount, expenses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addExpense = async (req, res) => {
    try {
        const { vehicle: vehicleId, category, amount, description, date } = req.body;

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: "Vehicle not found." });
        }

        const expense = await Expense.create({
            vehicle: vehicleId,
            category,
            amount,
            description,
            date,
            addedBy: req.user._id
        });

        const populated = await Expense.findById(expense._id)
            .populate("vehicle", "registrationNumber vehicleName");

        res.status(201).json({ success: true, expense: populated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) {
            return res.status(404).json({ success: false, message: "Expense not found." });
        }
        res.json({ success: true, message: "Expense deleted." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
