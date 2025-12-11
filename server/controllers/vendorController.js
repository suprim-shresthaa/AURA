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

        const application = await vendorApplicationModel.findById(appId);

        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        application.status = "approved";
        application.rejectionReason = undefined;
        await application.save();

        if (application.user) {
            await User.findByIdAndUpdate(application.user, { role: "vendor" });
        }

        await sendEmail(application.email, 'vendor-approved', { vendorName: application.fullName });
        res.json({ success: true, message: "Application approved", data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const rejectVendorApplication = async (req, res) => {
    try {
        const { appId } = req.params;
        const { rejectionReason } = req.body;

        if (!rejectionReason || !rejectionReason.trim()) {
            return res.status(400).json({ success: false, message: "Rejection reason is required" });
        }

        const application = await vendorApplicationModel.findById(appId);

        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        application.status = "rejected";
        application.rejectionReason = rejectionReason.trim();
        await application.save();

        if (application.user) {
            await User.findByIdAndUpdate(application.user, { role: "user" });
        }

        await sendEmail(application.email, 'vendor-rejected', {
            vendorName: application.fullName,
            rejectionReason: application.rejectionReason
        });

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
        const paidBookings = bookings.filter(b => b.paymentStatus === "paid");
        const totalEarnings = paidBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        // Monthly earnings (current month)
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);
        const monthlyEarnings = paidBookings
            .filter(b => new Date(b.createdAt) >= currentMonth)
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        // Today's earnings
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEarnings = paidBookings
            .filter(b => {
                const bookingDate = new Date(b.createdAt);
                bookingDate.setHours(0, 0, 0, 0);
                return bookingDate.getTime() === today.getTime();
            })
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        // Payment statistics
        const pendingPayments = bookings.filter(b => b.paymentStatus === "pending").length;
        const refundedPayments = bookings.filter(b => b.paymentStatus === "refunded").length;
        
        // eSewa payment statistics
        const esewaPayments = paidBookings.filter(b => b.paymentMethod === "esewa");
        const esewaRevenue = esewaPayments.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const successfulEsewaPayments = esewaPayments.filter(b => b.esewaTransactionUuid).length;

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
                todayEarnings,
                uniqueCustomers,
                // Payment details
                paidBookings: paidBookings.length,
                pendingPayments,
                refundedPayments,
                esewaPayments: esewaPayments.length,
                esewaRevenue,
                successfulEsewaPayments,
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
        const { status, paymentStatus, limit } = req.query;

        // Get all vehicles for this vendor
        const vehicles = await Vehicle.find({ vendorId });
        const vehicleIds = vehicles.map(v => v._id);

        // Build query
        const query = { vehicleId: { $in: vehicleIds } };
        if (status && status !== "all") {
            query.bookingStatus = status;
        }
        if (paymentStatus && paymentStatus !== "all") {
            query.paymentStatus = paymentStatus;
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

// Get vendor payment details
export const getVendorPayments = async (req, res) => {
    try {
        const vendorId = req.userId;
        const { 
            paymentStatus, 
            startDate,
            endDate,
            page = 1,
            limit = 20
        } = req.query;

        // Get all vehicles for this vendor
        const vehicles = await Vehicle.find({ vendorId });
        const vehicleIds = vehicles.map(v => v._id);

        // Build query
        const query = { vehicleId: { $in: vehicleIds } };
        
        if (paymentStatus && paymentStatus !== "all") {
            query.paymentStatus = paymentStatus;
        }
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get bookings with payment details
        const bookings = await Booking.find(query)
            .populate("userId", "name email contact")
            .populate("vehicleId", "name mainImage category")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await Booking.countDocuments(query);

        // Format payment data
        const payments = bookings.map(booking => ({
            id: booking._id,
            bookingId: booking._id,
            customer: {
                id: booking.userId?._id,
                name: booking.userId?.name,
                email: booking.userId?.email,
                contact: booking.userId?.contact
            },
            vehicle: {
                id: booking.vehicleId?._id,
                name: booking.vehicleId?.name,
                category: booking.vehicleId?.category,
                image: booking.vehicleId?.mainImage
            },
            amount: booking.totalAmount,
            rentPerDay: booking.rentPerDay,
            totalDays: booking.totalDays,
            paymentMethod: booking.paymentMethod,
            paymentStatus: booking.paymentStatus,
            bookingStatus: booking.bookingStatus,
            esewaTransactionUuid: booking.esewaTransactionUuid,
            esewaTransactionCode: booking.esewaTransactionCode,
            esewaRefId: booking.esewaRefId,
            startDate: booking.startDate,
            endDate: booking.endDate,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt
        }));

        res.json({
            success: true,
            data: {
                payments,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error("Error fetching vendor payments:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch payments",
            error: error.message
        });
    }
};
