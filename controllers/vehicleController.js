import Vehicle from "../models/vehicle.model.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import { upload } from "../config/cloudinary.js";


// Create vehicle
export const createVehicle = async (req, res) => {
    try {
        const {
            userId,
            name,
            category,
            modelYear,
            plateNumber,
            rentPerDay,
            condition,
            description,
        } = req.body;

        // Validate required vendorId
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Valid vendorId is required." });
        }

        // Validate required files
        if (!req.files?.mainImage || !req.files?.bluebook) {
            return res.status(400).json({ success: false, message: "Main image and bluebook are required." });
        }

        const mainImageUrl = req.files.mainImage[0].path;
        const bluebookUrl = req.files.bluebook[0].path;

        // Optional extra images
        const extraImagesUrls = req.files.images ? req.files.images.map(f => f.path) : [];

        // Create new Vehicle
        const newVehicle = new Vehicle({
            vendorId: userId,
            name,
            category,
            modelYear,
            plateNumber,
            rentPerDay,
            condition,
            description,
            mainImage: mainImageUrl,
            bluebook: bluebookUrl,
            images: extraImagesUrls,
        });

        await newVehicle.save();

        res.status(201).json({
            success: true,
            message: "Vehicle uploaded successfully!",
            data: newVehicle,
        });
    } catch (error) {
        console.error("Error uploading vehicle:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};


export const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        res.status(200).json({ success: true, data: vehicles });
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getVehiclesByVendor = async (req, res) => {
    try {
        const { vendorId } = req.query; // ✅ get from query
        if (!vendorId) {
            return res.status(400).json({ success: false, message: "vendorId is required." });
        }

        const vehicles = await Vehicle.find({ vendorId });
        res.status(200).json({ success: true, data: vehicles });
    } catch (error) {
        console.error("Error fetching vendor vehicles:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
