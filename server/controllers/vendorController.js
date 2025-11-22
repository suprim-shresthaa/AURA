import vendorApplicationModel from "../models/vendorApplication.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import sendEmail from "../utils/emailTemplates.js";

export const submitVendorApplication = async (req, res) => {
    try {
        const {
            fullName,
            businessName,
            email,
            phone,
            address,
            businessType,
            govIdType,
            govIdNumber,
            userId, // <-- Now receiving from frontend
        } = req.body;

        // 1. Validate required file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "ID Document is required.",
            });
        }

        // 2. Get Cloudinary URL
        const idDocumentUrl = req.file.path;

        // 3. Validate userId
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required. Please log in.",
            });
        }

        // Optional: Validate that userId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid User ID format.",
            });
        }

        // 4. Create new application with user reference
        const newApplication = new vendorApplicationModel({
            fullName,
            businessName: businessName || undefined,
            email,
            phone,
            address,
            businessType,
            govIdType,
            govIdNumber,
            idDocumentUrl,
            user: userId, // <-- Link to User
        });

        await newApplication.save();

        res.status(201).json({
            success: true,
            message: "Vendor application submitted successfully!",
            data: newApplication,
        });
    } catch (error) {
        console.error("Error submitting vendor application:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};


export const getVendorApplications = async (req, res) => {
    try {
        const applications = await vendorApplicationModel.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: applications });
    } catch (error) {
        console.error("Error fetching vendor applications:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}


export const approveVendorApplication = async (req, res) => {
    try {
        const { appId } = req.params;

        const application = await vendorApplicationModel.findByIdAndUpdate(
            appId,
            { status: "approved" },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        if (application.user) {
            await User.findByIdAndUpdate(application.user, { role: "vendor" });
            await sendEmail(application.email, 'vendor-approved', { vendorName: application.fullName });
        }
        res.json({ success: true, message: "Application approved", data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const rejectVendorApplication = async (req, res) => {
    try {
        const { appId } = req.params;

        const application = await vendorApplicationModel.findByIdAndUpdate(
            appId,
            { status: "rejected" },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        if (application.user) {
            await User.findByIdAndUpdate(application.user, { role: "user" });
            await sendEmail(application.email, 'vendor-rejected', { vendorName: application.fullName });
        }

        res.json({ success: true, message: "Application rejected", data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
