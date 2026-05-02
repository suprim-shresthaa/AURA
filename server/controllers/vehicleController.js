import Vehicle from "../models/vehicle.model.js";
import Booking from "../models/booking.model.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import { upload } from "../config/cloudinary.js";
import sendEmail from '../utils/emailTemplates.js';

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
            rentalFuel,
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
            fuelType, rentalFuel, transmission, seatingCapacity, mileage, rentPerDay, address, city
        };

        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value || value === "") {
                return res.status(400).json({ success: false, message: `${key} is required.` });
            }
        }

        const normalizedRentalFuel = String(rentalFuel).trim().toLowerCase();
        if (!["with", "without"].includes(normalizedRentalFuel)) {
            return res.status(400).json({ success: false, message: "rentalFuel must be \"with\" or \"without\"." });
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
            rentalFuel: normalizedRentalFuel,
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
            status: "Inactive",
            verificationStatus: "pending"
        });

        await newVehicle.save();

        // Send email notification to admin
        try {
            const vendor = await User.findById(vendorId).select('name email');
            const adminEmail = process.env.SENDER_EMAIL;
            
            if (adminEmail && vendor) {
                await sendEmail(adminEmail, 'vehicle-uploaded', {
                    vendorName: vendor.name,
                    vehicleName: name,
                    link: `${process.env.FRONTEND_URL}/admin/vehicles/${newVehicle._id}`
                });
            }
            console.log("Email sent to admin:", adminEmail);
        } catch (emailError) {
            console.error('Error sending vehicle upload notification to admins:', emailError);
            // Don't fail the request if email fails
        }

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
        // Only return approved and active vehicles for public listings
        const vehicles = await Vehicle.find({ 
            status: "Active",
            verificationStatus: "approved"
        });
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

        // Only show active and approved vehicles
        query.status = "Active";
        query.verificationStatus = "approved";

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
        const { vendorId } = req.query;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid vehicle ID." });
        }

        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: "Vehicle not found." });
        }

        if (vendorId) {
            if (!mongoose.Types.ObjectId.isValid(vendorId)) {
                return res.status(400).json({ success: false, message: "Valid vendorId is required." });
            }
            if (vehicle.vendorId.toString() !== vendorId) {
                return res.status(403).json({ success: false, message: "You don't have permission to delete this vehicle." });
            }
        }

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const blockingBooking = await Booking.findOne({
            vehicleId: id,
            bookingStatus: { $nin: ["cancelled", "completed"] },
            endDate: { $gte: startOfToday },
        }).select("_id");

        if (blockingBooking) {
            return res.status(409).json({
                success: false,
                message:
                    "This vehicle cannot be deleted because it still has an active or upcoming reservation in the booking period. Wait until the rental ends or cancel the booking first.",
            });
        }

        await Vehicle.findByIdAndDelete(id);
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

// Update a vehicle (allows vendors to edit and resubmit rejected vehicles)
export const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            vendorId,
            name,
            category,
            modelYear,
            condition,
            description,
            fuelType,
            rentalFuel,
            transmission,
            seatingCapacity,
            mileage,
            rentPerDay,
            pickupLocation,
        } = req.body;

        const address = pickupLocation?.address;
        const city = pickupLocation?.city;

        // Find the vehicle
        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: "Vehicle not found." });
        }

        // Check if vendor owns this vehicle
        if (vehicle.vendorId.toString() !== vendorId) {
            return res.status(403).json({ success: false, message: "You don't have permission to update this vehicle." });
        }

        // Validation
        const requiredFields = {
            name, category, modelYear, condition,
            fuelType, rentalFuel, transmission, seatingCapacity, mileage, rentPerDay, address, city
        };

        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value || value === "") {
                return res.status(400).json({ success: false, message: `${key} is required.` });
            }
        }

        const normalizedRentalFuel = String(rentalFuel).trim().toLowerCase();
        if (!["with", "without"].includes(normalizedRentalFuel)) {
            return res.status(400).json({ success: false, message: "rentalFuel must be \"with\" or \"without\"." });
        }

        // Handle images - use existing if not provided, otherwise use new uploads
        let mainImage = vehicle.mainImage;
        let bluebook = vehicle.bluebook;
        let images = vehicle.images || [];

        if (req.files?.mainImage?.[0]) {
            mainImage = req.files.mainImage[0].path;
        }
        if (req.files?.bluebook?.[0]) {
            bluebook = req.files.bluebook[0].path;
        }
        if (req.files?.images && req.files.images.length > 0) {
            images = req.files.images.map(f => f.path);
        }

        // Update vehicle fields
        vehicle.name = name.trim();
        vehicle.category = category;
        vehicle.modelYear = parseInt(modelYear);
        vehicle.condition = condition;
        vehicle.description = description?.trim() || "";
        vehicle.fuelType = fuelType;
        vehicle.rentalFuel = normalizedRentalFuel;
        vehicle.transmission = transmission;
        vehicle.seatingCapacity = parseInt(seatingCapacity);
        vehicle.mileage = parseInt(mileage);
        vehicle.rentPerDay = parseFloat(rentPerDay);
        vehicle.pickupLocation = {
            address: address.trim(),
            city: city.trim()
        };
        vehicle.mainImage = mainImage;
        vehicle.bluebook = bluebook;
        vehicle.images = images;

        vehicle.verificationStatus = "pending";
        vehicle.status = "Inactive";
        vehicle.rejectionReason = "";
        vehicle.verifiedBy = null;
        vehicle.verifiedAt = null;

        await vehicle.save();

        try {
            const vendor = await User.findById(vendorId).select("name email");
            const adminEmail = process.env.SENDER_EMAIL;

            if (adminEmail && vendor) {
                await sendEmail(adminEmail, "vehicle-updated", {
                    vendorName: vendor.name,
                    vehicleName: name.trim(),
                    link: `${process.env.FRONTEND_URL}/admin/vehicles/${vehicle._id}`,
                });
            }
        } catch (emailError) {
            console.error(
                "Error sending vehicle update notification to admin:",
                emailError,
            );
        }

        return res.status(200).json({
            success: true,
            message:
                "Vehicle updated successfully. It has been queued for admin review again.",
            data: vehicle,
        });

    } catch (error) {
        console.error("Error updating vehicle:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Toggle vehicle availability (vendor only)
export const toggleVehicleAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { isAvailable } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid vehicle ID"
            });
        }

        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }

        // Update availability
        vehicle.isAvailable = isAvailable;
        await vehicle.save();

        res.json({
            success: true,
            message: `Vehicle availability ${isAvailable ? 'enabled' : 'disabled'} successfully`,
            data: vehicle
        });

    } catch (error) {
        console.error("Error toggling vehicle availability:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

