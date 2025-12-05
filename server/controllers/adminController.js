import Booking from "../models/booking.model.js";
import Vehicle from "../models/vehicle.model.js";
import User from "../models/user.model.js";

/**
 * Get admin dashboard statistics including payment tracking
 */
export const getAdminStats = async (req, res) => {
    try {
        // Get all bookings
        const allBookings = await Booking.find()
            .populate("userId", "name email")
            .populate("vehicleId", "name vendorId")
            .sort({ createdAt: -1 });

        // Get all vehicles
        const allVehicles = await Vehicle.find();
        
        // Get all users
        const allUsers = await User.find();

        // Calculate booking statistics
        const totalBookings = allBookings.length;
        const confirmedBookings = allBookings.filter(b => b.bookingStatus === "confirmed").length;
        const activeBookings = allBookings.filter(b => b.bookingStatus === "active").length;
        const pendingBookings = allBookings.filter(b => b.bookingStatus === "pending").length;
        const completedBookings = allBookings.filter(b => b.bookingStatus === "completed").length;
        const cancelledBookings = allBookings.filter(b => b.bookingStatus === "cancelled").length;

        // Payment statistics
        const paidBookings = allBookings.filter(b => b.paymentStatus === "paid");
        const pendingPayments = allBookings.filter(b => b.paymentStatus === "pending");
        const refundedPayments = allBookings.filter(b => b.paymentStatus === "refunded");

        // Total revenue (only from paid bookings)
        const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        // Monthly revenue (current month)
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);
        const monthlyRevenue = paidBookings
            .filter(b => new Date(b.createdAt) >= currentMonth)
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        // Today's revenue
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayRevenue = paidBookings
            .filter(b => {
                const bookingDate = new Date(b.createdAt);
                bookingDate.setHours(0, 0, 0, 0);
                return bookingDate.getTime() === today.getTime();
            })
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        // Khalti payment statistics
        const khaltiPayments = paidBookings.filter(b => b.paymentMethod === "khalti");
        const khaltiRevenue = khaltiPayments.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const successfulKhaltiPayments = khaltiPayments.filter(b => b.khaltiTransactionId).length;

        // Revenue by month (last 6 months)
        const monthlyBreakdown = [];
        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date();
            monthDate.setMonth(monthDate.getMonth() - i);
            monthDate.setDate(1);
            monthDate.setHours(0, 0, 0, 0);
            
            const nextMonth = new Date(monthDate);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            
            const monthRevenue = paidBookings
                .filter(b => {
                    const bookingDate = new Date(b.createdAt);
                    return bookingDate >= monthDate && bookingDate < nextMonth;
                })
                .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
            
            monthlyBreakdown.push({
                month: monthDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
                revenue: monthRevenue,
                bookings: paidBookings.filter(b => {
                    const bookingDate = new Date(b.createdAt);
                    return bookingDate >= monthDate && bookingDate < nextMonth;
                }).length
            });
        }

        // Top vendors by revenue
        const vendorRevenue = {};
        paidBookings.forEach(booking => {
            const vendorId = booking.vehicleId?.vendorId?.toString();
            if (vendorId) {
                if (!vendorRevenue[vendorId]) {
                    vendorRevenue[vendorId] = {
                        vendorId,
                        revenue: 0,
                        bookings: 0
                    };
                }
                vendorRevenue[vendorId].revenue += booking.totalAmount || 0;
                vendorRevenue[vendorId].bookings += 1;
            }
        });

        const topVendors = Object.values(vendorRevenue)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // Populate vendor names
        for (const vendor of topVendors) {
            const vendorUser = await User.findById(vendor.vendorId);
            vendor.vendorName = vendorUser?.name || "Unknown Vendor";
        }

        res.json({
            success: true,
            data: {
                // Booking stats
                totalBookings,
                confirmedBookings,
                activeBookings,
                pendingBookings,
                completedBookings,
                cancelledBookings,
                
                // Payment stats
                totalRevenue,
                monthlyRevenue,
                todayRevenue,
                paidBookings: paidBookings.length,
                pendingPayments: pendingPayments.length,
                refundedPayments: refundedPayments.length,
                
                // Khalti stats
                khaltiPayments: khaltiPayments.length,
                khaltiRevenue,
                successfulKhaltiPayments,
                
                // System stats
                totalVehicles: allVehicles.length,
                availableVehicles: allVehicles.filter(v => v.isAvailable).length,
                totalUsers: allUsers.length,
                
                // Analytics
                monthlyBreakdown,
                topVendors,
                
                // Recent bookings
                recentBookings: allBookings.slice(0, 10)
            }
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch admin statistics",
            error: error.message
        });
    }
};

/**
 * Get all payments with filtering and pagination
 */
export const getAllPayments = async (req, res) => {
    try {
        const { 
            status, 
            paymentStatus, 
            paymentMethod,
            startDate,
            endDate,
            page = 1,
            limit = 20,
            sortBy = "createdAt",
            sortOrder = "desc"
        } = req.query;

        // Build query
        const query = {};
        
        if (status && status !== "all") {
            query.bookingStatus = status;
        }
        
        if (paymentStatus && paymentStatus !== "all") {
            query.paymentStatus = paymentStatus;
        }
        
        if (paymentMethod && paymentMethod !== "all") {
            query.paymentMethod = paymentMethod;
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
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

        // Get bookings with pagination
        const bookings = await Booking.find(query)
            .populate("userId", "name email contact")
            .populate("vehicleId", "name mainImage category vendorId")
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await Booking.countDocuments(query);

        // Format response
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
                image: booking.vehicleId?.mainImage,
                vendorId: booking.vehicleId?.vendorId
            },
            amount: booking.totalAmount,
            paymentMethod: booking.paymentMethod,
            paymentStatus: booking.paymentStatus,
            bookingStatus: booking.bookingStatus,
            khaltiPidx: booking.khaltiPidx,
            khaltiTransactionId: booking.khaltiTransactionId,
            startDate: booking.startDate,
            endDate: booking.endDate,
            totalDays: booking.totalDays,
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
        console.error("Error fetching payments:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch payments",
            error: error.message
        });
    }
};

/**
 * Get payment details by ID
 */
export const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id)
            .populate("userId", "name email contact")
            .populate("vehicleId", "name mainImage category vendorId")
            .populate("vehicleId.vendorId", "name email");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        res.json({
            success: true,
            data: {
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
                    image: booking.vehicleId?.mainImage,
                    vendor: {
                        id: booking.vehicleId?.vendorId?._id,
                        name: booking.vehicleId?.vendorId?.name,
                        email: booking.vehicleId?.vendorId?.email
                    }
                },
                amount: booking.totalAmount,
                rentPerDay: booking.rentPerDay,
                totalDays: booking.totalDays,
                paymentMethod: booking.paymentMethod,
                paymentStatus: booking.paymentStatus,
                bookingStatus: booking.bookingStatus,
                khaltiPidx: booking.khaltiPidx,
                khaltiTransactionId: booking.khaltiTransactionId,
                startDate: booking.startDate,
                endDate: booking.endDate,
                pickupLocation: booking.pickupLocation,
                notes: booking.notes,
                isPaymentDeferred: booking.isPaymentDeferred,
                createdAt: booking.createdAt,
                updatedAt: booking.updatedAt
            }
        });
    } catch (error) {
        console.error("Error fetching payment details:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch payment details",
            error: error.message
        });
    }
};

