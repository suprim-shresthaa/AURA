import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "Not Authorized. Please login again.",
            error: {
                detail: "No token provided",
                status_code: 401
            }
        });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(tokenDecode.id).select(
            "-password -__v -createdAt -updatedAt"
        );

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "User not found. Please login again.",
                error: {
                    detail: "User not found",
                    status_code: 401
                }
            });
        }

        req.user = user; // ✅ Attach full user object for use in routes

        req.userId = tokenDecode.id; // ✅ Set userId for easy access

        // ✅ Only set userId safely (avoid crash on GET)
        if (!req.body) req.body = {}; // Ensure req.body exists
        req.body.userId = tokenDecode.id;

        next();
    } catch (error) {
        console.error("❌ Auth Middleware Error:", error.message);
        
        // Handle specific JWT errors
        let errorMessage = "Invalid token. Please login again.";
        if (error.name === "TokenExpiredError") {
            errorMessage = "Token expired. Please login again.";
        } else if (error.name === "JsonWebTokenError") {
            errorMessage = "Invalid token. Please login again.";
        }
        
        return res.status(401).json({ 
            success: false, 
            message: errorMessage,
            error: {
                detail: errorMessage,
                status_code: 401
            }
        });
    }
};

export default userAuth;
