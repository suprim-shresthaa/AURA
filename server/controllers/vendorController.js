import vendorApplicationModel from "../models/vendorApplication.model.js";
import User from "../models/user.model.js";
import Vehicle from "../models/vehicle.model.js";
import Booking from "../models/booking.model.js";
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

// Get vendor dashboard statistics
export const getVendorStats = async (req, res) => {
    try {
        const vendorId = req.userId;

        // Get all vehicles for this vendor
        const vehicles = await Vehicle.find({ vendorId });

        // Get all bookings for vehicles owned by this vendor
        const vehicleIds = vehicles.map(v => v._id);
        const bookings = await Booking.find({ vehicleId: { $in: vehicleIds } })
            .populate("userId", "name email")
            .populate("vehicleId", "name mainImage category")
            .sort({ createdAt: -1 });

        // Calculate statistics
        const totalVehicles = vehicles.length;
        const availableVehicles = vehicles.filter(v => v.isAvailable).length;
        const totalBookings = bookings.length;
        const activeBookings = bookings.filter(b => 
            b.bookingStatus === "confirmed" || b.bookingStatus === "active"
        ).length;
        const pendingBookings = bookings.filter(b => b.bookingStatus === "pending").length;
        const completedBookings = bookings.filter(b => b.bookingStatus === "completed").length;

        // Calculate earnings
        const totalEarnings = bookings
            .filter(b => b.paymentStatus === "paid")
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        // Monthly earnings (current month)
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);
        const monthlyEarnings = bookings
            .filter(b => 
                b.paymentStatus === "paid" && 
                new Date(b.createdAt) >= currentMonth
            )
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        // Unique customers
        const uniqueCustomers = new Set(
            bookings.map(b => b.userId?._id?.toString()).filter(Boolean)
        ).size;

        // Top performing vehicles
        const vehiclePerformance = vehicles.map(vehicle => {
            const vehicleBookings = bookings.filter(b => 
                b.vehicleId?._id?.toString() === vehicle._id.toString()
            );
            const vehicleEarnings = vehicleBookings
                .filter(b => b.paymentStatus === "paid")
                .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
            
            return {
                vehicleId: vehicle._id,
                name: vehicle.name,
                category: vehicle.category,
                mainImage: vehicle.mainImage,
                bookings: vehicleBookings.length,
                earnings: vehicleEarnings,
                isAvailable: vehicle.isAvailable
            };
        }).sort((a, b) => b.bookings - a.bookings);

        res.json({
            success: true,
            data: {
                totalVehicles,
                availableVehicles,
                totalBookings,
                activeBookings,
                pendingBookings,
                completedBookings,
                totalEarnings,
                monthlyEarnings,
                uniqueCustomers,
                topVehicles: vehiclePerformance.slice(0, 5),
                recentBookings: bookings.slice(0, 10)
            }
        });
    } catch (error) {
        console.error("Error fetching vendor stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch vendor statistics",
            error: error.message
        });
    }
};

// Get vendor bookings
export const getVendorBookings = async (req, res) => {
    try {
        const vendorId = req.userId;
        const { status, limit } = req.query;

        // Get all vehicles for this vendor
        const vehicles = await Vehicle.find({ vendorId });
        const vehicleIds = vehicles.map(v => v._id);

        // Build query
        const query = { vehicleId: { $in: vehicleIds } };
        if (status && status !== "all") {
            query.bookingStatus = status;
        }

        // Get bookings
        let bookingsQuery = Booking.find(query)
            .populate("userId", "name email contact")
            .populate("vehicleId", "name mainImage category")
            .sort({ createdAt: -1 });

        if (limit) {
            bookingsQuery = bookingsQuery.limit(parseInt(limit));
        }

        const bookings = await bookingsQuery;

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error("Error fetching vendor bookings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings",
            error: error.message
        });
    }
};
