const User = require("../models/user");
const generateToken = require("../utils/generateToken");

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered." });
        }

        const user = await User.create({ name, email, password, role });
        const token = generateToken(user._id, user.role);

        const userResponse = await User.findById(user._id).select("-password");

        res.status(201).json({ success: true, token, user: userResponse });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        if (user.status !== "Active") {
            return res.status(403).json({ success: false, message: "Account is inactive. Contact administrator." });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        const token = generateToken(user._id, user.role);

        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
        };

        res.status(200).json({ success: true, token, user: userResponse });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.me = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};