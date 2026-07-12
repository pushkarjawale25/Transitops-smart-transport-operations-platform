const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
    try {
        let token = null;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token && req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ success: false, message: "Access denied. No token provided." });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtErr) {
            const message = jwtErr.name === "TokenExpiredError"
                ? "Session expired. Please log in again."
                : "Invalid token. Please log in again.";
            return res.status(401).json({ success: false, message });
        }

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ success: false, message: "User no longer exists." });
        }

        if (user.status !== "Active") {
            return res.status(403).json({ success: false, message: "Account is inactive. Contact administrator." });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(500).json({ success: false, message: "Authentication error." });
    }
};
