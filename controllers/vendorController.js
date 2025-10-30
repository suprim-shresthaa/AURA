import vendorApplicationModel from "../models/vendorApplication.model.js";

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
        } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "ID Document is required." });
        }

        // Cloudinary automatically uploads via multer-storage-cloudinary
        const idDocumentUrl = req.file.path; // URL from Cloudinary

        const userId = req.user?._id || null;

        console.log(userId);


        const newApplication = new vendorApplicationModel({
            fullName,
            businessName,
            email,
            phone,
            address,
            businessType,
            govIdType,
            govIdNumber,
            idDocumentUrl,
        });

        await newApplication.save();

        res.status(201).json({
            success: true,
            message: "Vendor application submitted successfully!",
            data: newApplication,
        });
    } catch (error) {
        console.error("Error submitting vendor application:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}


export const getVendorApplications = async (req, res) => {
    try {
        const applications = await vendorApplicationModel.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: applications });
    } catch (error) {
        console.error("Error fetching vendor applications:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}