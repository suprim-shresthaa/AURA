import userAuth from "./userAuth.js";

/**
 * Middleware to check if user is an admin
 * Must be used after userAuth middleware
 */
const adminAuth = async (req, res, next) => {
    try {
        // First check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Check if user is admin
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        next();
    } catch (error) {
        console.error("Admin auth error:", error);
        return res.status(500).json({
            success: false,
            message: "Authorization error"
        });
    }
};

// Combined middleware: userAuth + adminAuth
const requireAdmin = [userAuth, adminAuth];

export default requireAdmin;

