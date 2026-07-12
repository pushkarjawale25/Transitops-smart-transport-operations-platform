const User = require("../models/user");
const Role = require("../models/role");
const generateToken = require("../utils/generatetoken");

exports.register = async (req, res) => {

    try {

        const {
            firstName,
            lastName,
            email,
            password,
            role,
            phone
        } = req.body;

        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        const roleData = await Role.findOne({ name: role });

        if (!roleData) {
            return res.status(404).json({
                success: false,
                message: "Invalid Role. Valid roles: Super Admin, Fleet Manager, Driver, Safety Officer, Financial Analyst"
            });
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role: roleData._id,
            phone
        });

        const token = generateToken(user._id, roleData.name);

        const userResponse = await User.findById(user._id)
            .populate("role")
            .select("-password");

        res.status(201).json({
            success: true,
            token,
            user: userResponse
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }

};

exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() })
            .populate("role")
            .select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (user.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Account is disabled. Contact administrator."
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user._id, user.role.name);

        const userResponse = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            phone: user.phone,
            profileImage: user.profileImage,
            status: user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.status(200).json({
            success: true,
            token,
            user: userResponse
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }

};

exports.me = async (req, res) => {

    try {

        const user = await User.findById(req.user._id)
            .populate("role")
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }

};

exports.logout = async (req, res) => {

    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });

    res.status(200).json({
        success: true,
        message: "Logged Out Successfully"
    });

};