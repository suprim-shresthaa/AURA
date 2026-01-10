import Booking from "../models/booking.model.js";
import Vehicle from "../models/vehicle.model.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import mongoose from "mongoose";
import sendEmail from '../utils/emailTemplates.js';

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

        // eSewa payment statistics
        const esewaPayments = paidBookings.filter(b => b.paymentMethod === "esewa");
        const esewaRevenue = esewaPayments.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const successfulEsewaPayments = esewaPayments.filter(b => b.esewaTransactionUuid).length;

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
                
                // eSewa stats
                esewaPayments: esewaPayments.length,
                esewaRevenue,
                successfulEsewaPayments,
                
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
            esewaTransactionUuid: booking.esewaTransactionUuid,
            esewaTransactionCode: booking.esewaTransactionCode,
            esewaRefId: booking.esewaRefId,
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
 * Get all orders (spare parts orders) with filtering and pagination
 */
export const getAllOrders = async (req, res) => {
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
            query.orderStatus = status;
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

        // Get orders with pagination
        const orders = await Order.find(query)
            .populate("userId", "name email contact")
            .populate("items.sparePartId", "name category images price")
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await Order.countDocuments(query);

        // Format response
        const formattedOrders = orders.map(order => ({
            id: order._id,
            orderId: order._id,
            customer: {
                id: order.userId?._id,
                name: order.userId?.name,
                email: order.userId?.email,
                contact: order.userId?.contact
            },
            items: order.items.map(item => ({
                id: item._id,
                sparePartId: item.sparePartId?._id,
                partName: item.partName || item.sparePartId?.name,
                category: item.sparePartId?.category,
                image: item.sparePartId?.images?.[0],
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice
            })),
            totalAmount: order.totalAmount,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus,
            esewaTransactionUuid: order.esewaTransactionUuid,
            esewaRefId: order.esewaRefId,
            deliveryAddress: order.deliveryAddress,
            notes: order.notes,
            createdAt: order.createdAt,
            paidAt: order.paidAt,
            shippedAt: order.shippedAt,
            deliveredAt: order.deliveredAt,
            updatedAt: order.updatedAt
        }));

        res.json({
            success: true,
            data: {
                orders: formattedOrders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message
        });
    }
};

/**
 * Update order status (admin only)
 */
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderStatus } = req.body;

        // Validate orderStatus
        const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid order status. Must be one of: ${validStatuses.join(", ")}`
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Prepare update object
        const updateData = {
            orderStatus: orderStatus
        };

        // Update timestamps based on status
        if (orderStatus === "shipped" && !order.shippedAt) {
            updateData.shippedAt = new Date();
        } else if (orderStatus === "delivered" && !order.deliveredAt) {
            updateData.deliveredAt = new Date();
            // Also set shippedAt if not already set
            if (!order.shippedAt) {
                updateData.shippedAt = new Date();
            }
        }

        // Update the order
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            updateData,
            { new: true }
        ).populate("userId", "name email contact")
         .populate("items.sparePartId", "name category images price");

        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found after update"
            });
        }

        // Format response similar to getAllOrders
        const formattedOrder = {
            id: updatedOrder._id,
            orderId: updatedOrder._id,
            customer: {
                id: updatedOrder.userId?._id,
                name: updatedOrder.userId?.name,
                email: updatedOrder.userId?.email,
                contact: updatedOrder.userId?.contact
            },
            items: updatedOrder.items.map(item => ({
                id: item._id,
                sparePartId: item.sparePartId?._id,
                partName: item.partName || item.sparePartId?.name,
                category: item.sparePartId?.category,
                image: item.sparePartId?.images?.[0],
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice
            })),
            totalAmount: updatedOrder.totalAmount,
            paymentMethod: updatedOrder.paymentMethod,
            paymentStatus: updatedOrder.paymentStatus,
            orderStatus: updatedOrder.orderStatus,
            esewaTransactionUuid: updatedOrder.esewaTransactionUuid,
            esewaRefId: updatedOrder.esewaRefId,
            deliveryAddress: updatedOrder.deliveryAddress,
            notes: updatedOrder.notes,
            createdAt: updatedOrder.createdAt,
            paidAt: updatedOrder.paidAt,
            shippedAt: updatedOrder.shippedAt,
            deliveredAt: updatedOrder.deliveredAt,
            updatedAt: updatedOrder.updatedAt
        };

        res.json({
            success: true,
            message: `Order status updated to ${orderStatus}`,
            data: formattedOrder
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update order status",
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
                esewaTransactionUuid: booking.esewaTransactionUuid,
                esewaTransactionCode: booking.esewaTransactionCode,
                esewaRefId: booking.esewaRefId,
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

/**
 * Get all pending vehicles awaiting verification
 */
export const getPendingVehicles = async (req, res) => {
    try {
        const pendingVehicles = await Vehicle.find({ verificationStatus: "pending" })
            .populate({
                path: "vendorId",
                model: "User",
                select: "name email contact address image"
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: pendingVehicles
        });
    } catch (error) {
        console.error("Error fetching pending vehicles:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch pending vehicles",
            error: error.message
        });
    }
};

/**
 * Get a single vehicle by ID for admin
 */
export const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;

        const vehicle = await Vehicle.findById(id)
            .populate({
                path: "vendorId",
                model: "User",
                select: "name email contact address image"
            });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }

        res.json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        console.error("Error fetching vehicle by ID:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch vehicle",
            error: error.message
        });
    }
};

/**
 * Approve a vehicle
 */
export const approveVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.userId;

        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }

        if (vehicle.verificationStatus === "approved") {
            return res.status(400).json({
                success: false,
                message: "Vehicle is already approved"
            });
        }

        vehicle.verificationStatus = "approved";
        vehicle.status = "Active";
        vehicle.verifiedBy = adminId;
        vehicle.verifiedAt = new Date();
        vehicle.rejectionReason = ""; // Clear any previous rejection reason

        await vehicle.save();

        // Send email notification to vendor
        try {
            const vendor = await User.findById(vehicle.vendorId).select('name email');
            if (vendor) {
                await sendEmail(vendor.email, 'vehicle-approved', {
                    vendorName: vendor.name,
                    vehicleName: vehicle.name,
                    link: `${process.env.FRONTEND_URL}/vehicles/${vehicle._id}`
                }).catch(err => {
                    console.error('Failed to send vehicle approval email:', err);
                });
            }
        } catch (emailError) {
            console.error('Error sending vehicle approval notification:', emailError);
            // Don't fail the request if email fails
        }

        res.json({
            success: true,
            message: "Vehicle approved successfully",
            data: vehicle
        });
    } catch (error) {
        console.error("Error approving vehicle:", error);
        res.status(500).json({
            success: false,
            message: "Failed to approve vehicle",
            error: error.message
        });
    }
};

/**
 * Reject a vehicle with reason
 */
export const rejectVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;
        const adminId = req.userId;

        if (!rejectionReason || rejectionReason.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required"
            });
        }

        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }

        if (vehicle.verificationStatus === "rejected") {
            return res.status(400).json({
                success: false,
                message: "Vehicle is already rejected"
            });
        }

        vehicle.verificationStatus = "rejected";
        vehicle.status = "Inactive";
        vehicle.rejectionReason = rejectionReason.trim();
        vehicle.verifiedBy = adminId;
        vehicle.verifiedAt = new Date();

        await vehicle.save();

        // Send email notification to vendor
        try {
            const vendor = await User.findById(vehicle.vendorId).select('name email');
            if (vendor) {
                await sendEmail(vendor.email, 'vehicle-rejected', {
                    vendorName: vendor.name,
                    vehicleName: vehicle.name,
                    rejectionReason: rejectionReason.trim(),
                    link: `${process.env.FRONTEND_URL}/vendor/listings`
                }).catch(err => {
                    console.error('Failed to send vehicle rejection email:', err);
                });
            }
        } catch (emailError) {
            console.error('Error sending vehicle rejection notification:', emailError);
            // Don't fail the request if email fails
        }

        res.json({
            success: true,
            message: "Vehicle rejected successfully",
            data: vehicle
        });
    } catch (error) {
        console.error("Error rejecting vehicle:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reject vehicle",
            error: error.message
        });
    }
};

/**
 * Get all pending licenses awaiting approval
 */
export const getPendingLicenses = async (req, res) => {
    try {
        const users = await User.find({ "licenses.status": "pending" })
            .select("name email licenses")
            .lean();

        const pendingLicenses = [];
        const seenLicenseIds = new Set(); // Track seen license IDs to prevent duplicates
        
        users.forEach(user => {
            user.licenses.forEach(license => {
                if (license.status === "pending") {
                    const licenseId = license._id?.toString();
                    
                    // Skip if we've already added this license (prevent duplicates)
                    if (seenLicenseIds.has(licenseId)) {
                        return;
                    }
                    
                    seenLicenseIds.add(licenseId);
                    
                    // Expand license with multiple vehicleTypes into individual entries for frontend compatibility
                    const vehicleTypes = license.vehicleTypes || [];
                    vehicleTypes.forEach(vehicleType => {
                        pendingLicenses.push({
                            _id: licenseId,
                            userId: user._id?.toString(), // Ensure userId is a string for consistent grouping
                            userName: user.name,
                            userEmail: user.email,
                            vehicleType: vehicleType,
                            vehicleTypes: vehicleTypes, // Include full array for reference
                            licenseImage: license.licenseImage,
                            status: license.status,
                            uploadedAt: license.uploadedAt
                        });
                    });
                }
            });
        });

        res.json({
            success: true,
            data: pendingLicenses
        });
    } catch (error) {
        console.error("Error fetching pending licenses:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch pending licenses",
            error: error.message
        });
    }
};

/**
 * Approve a license
 */
export const approveLicense = async (req, res) => {
    try {
        const { licenseId } = req.params;
        const adminId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(licenseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid license ID"
            });
        }

        const user = await User.findOne({ "licenses._id": licenseId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "License not found"
            });
        }

        const license = user.licenses.id(licenseId);
        if (!license) {
            return res.status(404).json({
                success: false,
                message: "License not found"
            });
        }

        if (license.status === "approved") {
            return res.status(400).json({
                success: false,
                message: "License is already approved"
            });
        }

        // Check if license is already approved
        if (license.status === "approved") {
            return res.status(400).json({
                success: false,
                message: "License is already approved"
            });
        }

        // Approve the license
        license.status = "approved";
        license.approvedBy = adminId;
        license.approvedAt = new Date();
        license.rejectionReason = ""; // Clear any previous rejection reason

        await user.save();

        // Send email notification to user
        try {
            const vehicleTypes = license.vehicleTypes || [];
            await sendEmail(user.email, 'license-approved', {
                userName: user.name,
                vehicleTypes: vehicleTypes.join(", ")
            }).catch(err => {
                console.error('Failed to send license approval email:', err);
            });
        } catch (emailError) {
            console.error('Error sending license approval notification:', emailError);
            // Don't fail the request if email fails
        }

        res.json({
            success: true,
            message: "License approved successfully",
            data: license
        });
    } catch (error) {
        console.error("Error approving license:", error);
        res.status(500).json({
            success: false,
            message: "Failed to approve license",
            error: error.message
        });
    }
};

/**
 * Reject a license with reason
 */
export const rejectLicense = async (req, res) => {
    try {
        const { licenseId } = req.params;
        const { rejectionReason } = req.body;
        const adminId = req.userId;

        if (!rejectionReason || rejectionReason.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(licenseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid license ID"
            });
        }

        const user = await User.findOne({ "licenses._id": licenseId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "License not found"
            });
        }

        const license = user.licenses.id(licenseId);
        if (!license) {
            return res.status(404).json({
                success: false,
                message: "License not found"
            });
        }

        if (license.status === "rejected") {
            return res.status(400).json({
                success: false,
                message: "License is already rejected"
            });
        }

        // Reject the license
        license.status = "rejected";
        license.rejectionReason = rejectionReason.trim();
        license.approvedBy = adminId;
        license.approvedAt = new Date();

        await user.save();

        // Send email notification to user
        try {
            const vehicleTypes = license.vehicleTypes || [];
            await sendEmail(user.email, 'license-rejected', {
                userName: user.name,
                vehicleTypes: vehicleTypes.join(", "),
                rejectionReason: rejectionReason.trim()
            }).catch(err => {
                console.error('Failed to send license rejection email:', err);
            });
        } catch (emailError) {
            console.error('Error sending license rejection notification:', emailError);
            // Don't fail the request if email fails
        }

        res.json({
            success: true,
            message: "License rejected successfully",
            data: license
        });
    } catch (error) {
        console.error("Error rejecting license:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reject license",
            error: error.message
        });
    }
};

