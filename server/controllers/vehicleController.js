import Vehicle from "../models/vehicle.model.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import { upload } from "../config/cloudinary.js";

// Create a new vehicle
export const createVehicle = async (req, res) => {
    try {
        const {
            vendorId,
            name,
            category,
            modelYear,
            condition,
            description,
            fuelType,
            transmission,
            seatingCapacity,
            mileage,
            rentPerDay,
            pickupLocation,
        } = req.body;

        const address = pickupLocation?.address;
        const city = pickupLocation?.city;

        console.log("BODY:", req.body);

        // Validation
        if (!vendorId || !mongoose.Types.ObjectId.isValid(vendorId)) {
            return res.status(400).json({ success: false, message: "Valid vendorId is required." });
        }

        const requiredFields = {
            name, category, modelYear, condition,
            fuelType, transmission, seatingCapacity, mileage, rentPerDay, address, city
        };

        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value || value === "") {
                return res.status(400).json({ success: false, message: `${key} is required.` });
            }
        }

        if (!req.files?.mainImage?.[0] || !req.files?.bluebook?.[0]) {
            return res.status(400).json({ success: false, message: "Main image and bluebook are required." });
        }

        const mainImage = req.files.mainImage[0].path;
        const bluebook = req.files.bluebook[0].path;
        const images = req.files.images ? req.files.images.map(f => f.path) : [];

        const newVehicle = new Vehicle({
            vendorId,
            name: name.trim(),
            category,
            modelYear: parseInt(modelYear),
            condition,
            description: description?.trim() || "",
            fuelType,
            transmission,
            seatingCapacity: parseInt(seatingCapacity),
            mileage: parseInt(mileage),
            rentPerDay: parseFloat(rentPerDay),
            pickupLocation: {
                address: address.trim(),
                city: city.trim()
            },
            mainImage,
            bluebook,
            images,
            isAvailable: true,
            status: "Active"
        });

        await newVehicle.save();

        return res.status(201).json({
            success: true,
            message: "Vehicle uploaded successfully!",
            data: newVehicle
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
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

export const searchVehicles = async (req, res) => {
    try {
        const {
            search,
            keyword,
            category,
            transmission,
            priceRange,
            fuelType,
            minPrice,
            maxPrice,
            city,
            isAvailable
        } = req.query;

        // Build query
        const query = {};

        // Search by name or description (support both 'search' and 'keyword' parameters)
        const searchTerm = keyword || search;
        if (searchTerm) {
            query.$or = [
                { name: { $regex: searchTerm, $options: "i" } },
                { description: { $regex: searchTerm, $options: "i" } }
            ];
        }

        // Category filter
        if (category && category !== "all") {
            query.category = category;
        }

        // Transmission filter
        if (transmission && transmission !== "all") {
            query.transmission = transmission;
        }

        // Fuel type filter
        if (fuelType && fuelType !== "all") {
            query.fuelType = fuelType;
        }

        // Price range filter
        if (priceRange && priceRange !== "all") {
            switch (priceRange) {
                case "low":
                    query.rentPerDay = { $lt: 500 };
                    break;
                case "medium":
                    query.rentPerDay = { $gte: 500, $lt: 1500 };
                    break;
                case "high":
                    query.rentPerDay = { $gte: 1500 };
                    break;
            }
        }

        // Custom price range
        if (minPrice || maxPrice) {
            query.rentPerDay = {};
            if (minPrice) query.rentPerDay.$gte = parseFloat(minPrice);
            if (maxPrice) query.rentPerDay.$lte = parseFloat(maxPrice);
        }

        // City filter
        if (city && city !== "all") {
            query["pickupLocation.city"] = { $regex: city, $options: "i" };
        }

        // Availability filter
        if (isAvailable !== undefined) {
            query.isAvailable = isAvailable === "true" || isAvailable === true;
        }

        // Only show active vehicles
        query.status = "Active";

        const vehicles = await Vehicle.find(query)
            .populate({
                path: "vendorId",
                model: "User",
                select: "name email image contact address"
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: vehicles });
    } catch (error) {
        console.error("Error searching vehicles:", error);
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


export const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid vehicle ID." });
        }
        const deletedVehicle = await Vehicle.findByIdAndDelete(id);
        if (!deletedVehicle) {
            return res.status(404).json({ success: false, message: "Vehicle not found." });
        }
        res.status(200).json({ success: true, message: "Vehicle deleted successfully." });
    } catch (error) {
        console.error("Error deleting vehicle:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


export const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;

        const vehicle = await Vehicle.findById(id)
            .populate({
                path: "vendorId",
                model: "User",
                select: "name email image contact address"
            });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: vehicle
        });

    } catch (error) {
        console.error("Error fetching vehicle by ID:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

