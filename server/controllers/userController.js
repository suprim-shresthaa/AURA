import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";


export const getUserData = async (req, res) => {
    try {
        const { userId } = req.body;

        // Ensure userId is provided
        if (!userId) {
            return res.json({ success: false, message: 'User ID is required' });
        }

        // Find user by the provided userId
        const user = await User.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Initialize user data object
        const userData = {
            userId: user._id,
            name: user.name,
            email: user.email,
            isAccountVerified: user.isAccountVerified,
            role: user.role,
            image: user.image,
            contact: user.contact,
            address: user.address,
            banInfo: user.banInfo,
        };

        // Return the user data
        res.json({
            success: true,
            userData,
        });

    } catch (error) {
        // Return the error message in the response
        res.json({ success: false, message: error.message });
    }
};


export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ success: true, data: users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Profile Image Controller
export const updateProfileImage = async (req, res) => {
    try {
        const { email, image } = req.body;

        if (!email || !image) {
            return res
                .status(400)
                .json({ success: false, message: "Email and image URL are required." });
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found." });
        }

        // Update user's profile image
        user.image = image;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile image updated successfully.",
            image: user.image,
        });
    } catch (error) {
        console.error("Error updating profile image:", error);
        res.status(500).json({
            success: false,
            message: "Server error. Please try again later.",
        });
    }
};

export const changePassword = async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;

    try {
        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields."
            });
        }

        console.log("Received:", req.body);

        // MUST explicitly select password
        const user = await User.findById(userId).select("+password");

        console.log("User found:", user);
        console.log("Old Password:", oldPassword);
        console.log("User Password:", user?.password);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // Compare old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Old password is incorrect."
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Save new password
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully."
        });

    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

/**
 * Upload license for a specific vehicle type
 */
export const uploadLicense = async (req, res) => {
    try {
        const userId = req.userId;
        const { vehicleType } = req.body;

        if (!vehicleType || !["Car", "Bike", "Scooter", "Jeep", "Van"].includes(vehicleType)) {
            return res.status(400).json({
                success: false,
                message: "Valid vehicle type is required (Car, Bike, Scooter, Jeep, Van)"
            });
        }

        if (!req.files?.licenseImage?.[0]) {
            return res.status(400).json({
                success: false,
                message: "License image is required"
            });
        }

        const licenseImage = req.files.licenseImage[0].path;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if user already has a license (pending or approved) for this vehicle type
        const existingLicense = user.licenses.find(
            license => license.vehicleType === vehicleType && license.status !== "rejected"
        );

        if (existingLicense) {
            return res.status(400).json({
                success: false,
                message: `You already have a ${existingLicense.status} license for ${vehicleType}. Please wait for admin approval or update the existing license.`
            });
        }

        // Remove any rejected licenses for this vehicle type
        user.licenses = user.licenses.filter(license => !(license.vehicleType === vehicleType && license.status === "rejected"));

        // Add new license
        user.licenses.push({
            vehicleType,
            licenseImage,
            status: "pending",
            uploadedAt: new Date()
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: "License uploaded successfully. It will be reviewed by an admin.",
            data: user.licenses[user.licenses.length - 1]
        });
    } catch (error) {
        console.error("Error uploading license:", error);
        res.status(500).json({
            success: false,
            message: "Failed to upload license",
            error: error.message
        });
    }
};

/**
 * Get user's licenses
 */
export const getMyLicenses = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId).select("licenses");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            data: user.licenses || []
        });
    } catch (error) {
        console.error("Error fetching licenses:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch licenses",
            error: error.message
        });
    }
};
