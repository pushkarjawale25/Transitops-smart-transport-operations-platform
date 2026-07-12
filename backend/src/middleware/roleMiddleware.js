exports.authorize = (...allowedRoles) => {

    return (req, res, next) => {

        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Authentication required."
            });
        }

        const userRole = req.user.role.name;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Access Denied. Required role(s): ${allowedRoles.join(", ")}. Your role: ${userRole}`
            });
        }

        next();

    };

};