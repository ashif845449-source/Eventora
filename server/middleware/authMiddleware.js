const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async(req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check token
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Not authorized, no token"
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return res.status(401).json({
                message: "Not authorized, user not found"
            });
        }

        next();

    } catch (error) {
        console.error("Auth Error:", error);

        return res.status(401).json({
            message: "Not authorized, token failed"
        });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({
            message: "Not authorized as an admin"
        });
    }
};

module.exports = {
    protect,
    admin
};