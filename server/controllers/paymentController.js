import axios from "axios";
import crypto from "crypto";
import Booking from "../models/booking.model.js";
import Vehicle from "../models/vehicle.model.js";
import User from "../models/user.model.js";
import SparePart from "../models/sparePart.model.js";
import sendEmail from "../utils/emailTemplates.js";

// eSewa API configuration
const ESEWA_BASE_URL = process.env.ESEWA_BASE_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";    
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";

// Validate eSewa configuration
if (!ESEWA_SECRET_KEY) {
    console.error("⚠️  WARNING: ESEWA_SECRET_KEY is not set in environment variables!");
    console.error("   Please add ESEWA_SECRET_KEY to your .env file");
}

// Temporary storage for booking data
const pendingBookingData = new Map();

/**
 * Generate HMAC SHA256 signature for eSewa
 * According to eSewa docs: HMAC SHA256 with base64 output
 */
const generateEsewaSignature = (data, secretKey) => {
    try {
        const dataString = String(data);
        const secretKeyString = String(secretKey);
        
        // Create HMAC with SHA256
        const hmac = crypto.createHmac("sha256", secretKeyString);
        hmac.update(dataString, "utf8");
        
        // Return base64 encoded digest
        return hmac.digest("base64");
    } catch (error) {
        console.error("Error generating eSewa signature:", error);
        throw error;
    }
};

function createEsewaSignature({ total_amount, transaction_uuid, product_code }) {    
    const totalAmountStr = String(total_amount).trim();
    const transactionUuidStr = String(transaction_uuid).trim();
    const productCodeStr = String(product_code).trim();
    
    // Signature must use exact total_amount value as sent in form
    // Format: field_name=value,field_name=value,field_name=value
    // According to eSewa docs, the order and format must match exactly
    const message = `total_amount=${totalAmountStr},transaction_uuid=${transactionUuidStr},product_code=${productCodeStr}`;
    const hmac = crypto.createHmac('sha256', ESEWA_SECRET_KEY);
    hmac.update(message, 'utf8');
    const signature = hmac.digest('base64');
    return signature;
}

/**
 * Helper function to create booking from payment data
 */
const createBookingFromPaymentData = async (bookingData, userId) => {
    const { vehicleId, sparePartId, startDate, endDate, totalDays, rentPerDay, totalAmount, notes, paymentMethod, bookingType, insuranceSelected, insuranceAmount } = bookingData;

    let bookingDataToCreate = {
        userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalDays,
        rentPerDay,
        totalAmount,
        paymentMethod,
        paymentStatus: "paid",
        bookingStatus: "confirmed",
        notes: notes || "",
        isPaymentDeferred: false,
        bookingType: bookingType || (vehicleId ? "vehicle" : "sparePart")
    };

    // Attach insurance information if present
    if (insuranceSelected) {
        bookingDataToCreate.insuranceSelected = true;
        bookingDataToCreate.insuranceAmount = insuranceAmount || 0;
        bookingDataToCreate.insuranceDetails = "Accidental coverage";
    }

    if (vehicleId) {
        // Vehicle booking
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            throw new Error("Vehicle not found");
        }

        bookingDataToCreate.vehicleId = vehicleId;
        bookingDataToCreate.pickupLocation = vehicle.pickupLocation;
    } else if (sparePartId) {
        // Spare part booking
        const sparePart = await SparePart.findById(sparePartId);
        if (!sparePart) {
            throw new Error("Spare part not found");
        }

        bookingDataToCreate.sparePartId = sparePartId;
        bookingDataToCreate.pickupLocation = {
            address: "Store Location",
            city: "Kathmandu"
        };
    } else {
        throw new Error("Either vehicleId or sparePartId must be provided");
    }

    // Create booking
    const booking = await Booking.create(bookingDataToCreate);

    return booking;
};


/**
 * Initiate eSewa payment - booking will be created only after payment succeeds
 */
export const initiateEsewaPayment = async (req, res) => {
    try {
        // Validate eSewa configuration
        if (!ESEWA_SECRET_KEY) {
            return res.status(500).json({
                success: false,
                message: "Payment service is not configured. Please contact support."
            });
        }

        const { bookingData } = req.body;
        const userId = req.userId;

        if (!bookingData) {
            return res.status(400).json({
                success: false,
                message: "Booking data is required"
            });
        }

        const { vehicleId, sparePartId, startDate, endDate, totalDays, rentPerDay, totalAmount, notes, bookingType } = bookingData;

        // Validate required fields
        if ((!vehicleId && !sparePartId) || !startDate || !endDate || !totalDays || !rentPerDay || !totalAmount) {
            return res.status(400).json({
                success: false,
                message: "All booking fields are required"
            });
        }

        if (vehicleId && sparePartId) {
            return res.status(400).json({
                success: false,
                message: "Cannot book both vehicle and spare part in one booking"
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (vehicleId) {
            // Vehicle booking validation
            const vehicle = await Vehicle.findById(vehicleId);
            if (!vehicle) {
                return res.status(404).json({
                    success: false,
                    message: "Vehicle not found"
                });
            }

            // Check if vehicle is available
            if (!vehicle.isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: "Vehicle is not available for booking"
                });
            }

            // Check for overlapping bookings
            const overlappingBookings = await Booking.find({
                vehicleId,
                bookingStatus: { $in: ["pending", "confirmed", "active"] },
                $or: [
                    {
                        startDate: { $lte: end },
                        endDate: { $gte: start }
                    }
                ]
            });

            if (overlappingBookings.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Vehicle is already booked for the selected dates"
                });
            }
        } else if (sparePartId) {
            // Spare part booking validation
            const sparePart = await SparePart.findById(sparePartId);
            if (!sparePart) {
                return res.status(404).json({
                    success: false,
                    message: "Spare part not found"
                });
            }

            if (!sparePart.rentPrice) {
                return res.status(400).json({
                    success: false,
                    message: "This spare part is not available for rent"
                });
            }

            if (!sparePart.isAvailable || sparePart.stock <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Spare part is out of stock"
                });
            }

            // Check for overlapping bookings
            const overlappingBookings = await Booking.find({
                sparePartId,
                bookingStatus: { $in: ["pending", "confirmed", "active"] },
                $or: [
                    {
                        startDate: { $lte: end },
                        endDate: { $gte: start }
                    }
                ]
            });

            // Check if stock is sufficient
            const bookedQuantity = overlappingBookings.length;
            if (sparePart.stock <= bookedQuantity) {
                return res.status(400).json({
                    success: false,
                    message: "Spare part is not available for the selected dates"
                });
            }
        }

        // Validate amount (minimum 1 rupee)
        if (totalAmount < 1) {
            return res.status(400).json({
                success: false,
                message: "Amount must be at least Rs. 1"
            });
        }

        // Generate unique transaction UUID (will be used to retrieve booking data in callback)
        const entityId = vehicleId || sparePartId;
        const transactionUuid = `esewa_${Date.now()}_${userId}_${entityId}`;
        const signedFieldNames = "total_amount,transaction_uuid,product_code";
        
        // Store booking data temporarily (will be retrieved in callback)
        pendingBookingData.set(transactionUuid, {
            userId,
            vehicleId: vehicleId || null,
            sparePartId: sparePartId || null,
            bookingType: bookingType || (vehicleId ? "vehicle" : "sparePart"),
            startDate,
            endDate,
            totalDays,
            rentPerDay,
            totalAmount,
            notes: notes || "",
            paymentMethod: "esewa",
            insuranceSelected: !!bookingData.insuranceSelected,
            insuranceAmount: bookingData.insuranceAmount || 0
        });
        
        // total_amount should always have 2 decimal places for eSewa
        const totalAmountFormatted = totalAmount.toFixed(2);
        
        // Generate signature using createEsewaSignature function
        const signature = createEsewaSignature({
            total_amount: totalAmountFormatted,
            transaction_uuid: transactionUuid,
            product_code: ESEWA_PRODUCT_CODE
        });

        let serverUrl = process.env.VITE_API_BASE_URL;
            
        const successUrl = `${serverUrl}/api/payments/esewa/callback`;
        const failureUrl = `${serverUrl}/api/payments/esewa/callback`;

        res.json({
            success: true,
            message: "Payment initiated successfully",
            data: {
                transactionUuid,
                formData: {
                    amount: totalAmount.toFixed(2),
                    tax_amount: "0",
                    total_amount: totalAmountFormatted,
                    transaction_uuid: transactionUuid,
                    product_code: ESEWA_PRODUCT_CODE,
                    product_service_charge: "0",
                    product_delivery_charge: "0",
                    success_url: successUrl,
                    failure_url: failureUrl,
                    signed_field_names: signedFieldNames,
                    signature: signature
                },
                formUrl: ESEWA_BASE_URL,
                transactionUuid: transactionUuid
            }
        });
    } catch (error) {
        console.error("Error initiating eSewa payment:", error);
        
        res.status(500).json({
            success: false,
            message: error.message || "Failed to initiate payment"
        });
    }
};

/**
 * Handle eSewa payment callback (success/failure)
 */
export const esewaPaymentCallback = async (req, res) => {
    try {
        // Log all incoming data for debugging
        // console.log("=== eSewa Callback Received ===");
        // console.log("Method:", req.method);
        // console.log("Query params:", JSON.stringify(req.query, null, 2));
        // console.log("Body:", JSON.stringify(req.body, null, 2));
        // console.log("Headers:", JSON.stringify(req.headers, null, 2));
        // console.log("================================");

        let callbackData = req.query || {};

        const decodedJson = Buffer.from(callbackData.data, "base64").toString("utf-8");
       callbackData = JSON.parse(decodedJson);

        console.log("Decoded eSewa callback data:", callbackData);

        // Extract data
        const transaction_code = callbackData.transaction_code;
        const status = callbackData.status;
        const total_amount = callbackData.total_amount;
        const transaction_uuid = callbackData.transaction_uuid;
        const product_code = callbackData.product_code;
        const signed_field_names = callbackData.signed_field_names;
        const signature = callbackData.signature;

        // Retrieve booking data from temporary storage
        const bookingData = pendingBookingData.get(transaction_uuid);

        if (!bookingData) {
            return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/failed?error=booking_data_not_found`);
        }

        // Verify signature 
        let signatureValid = true;
        if (signature && signed_field_names) {
            const signatureData = signed_field_names.split(",")
                .map(field => {
                    const fieldName = field.trim();
                    let fieldValue = "";
                    switch (fieldName) {
                        case "transaction_code": fieldValue = transaction_code || ""; break;
                        case "status": fieldValue = status || ""; break;
                        case "total_amount": fieldValue = total_amount || ""; break;
                        case "transaction_uuid": fieldValue = transaction_uuid || ""; break;
                        case "product_code": fieldValue = product_code || ""; break;
                        case "signed_field_names": fieldValue = signed_field_names || ""; break;
                        default: fieldValue = "";
                    }
                    return `${fieldName}=${fieldValue}`;
                })
                .join(",");

            const expectedSignature = generateEsewaSignature(signatureData, ESEWA_SECRET_KEY);
            signatureValid = signature === expectedSignature;
            
            if (!signatureValid) {
                console.error("Signature verification failed");
                console.error("Expected:", expectedSignature);
                console.error("Received:", signature);
                console.error("Signature data:", signatureData);
            }
        }

        // Handle different statuses
        if (status === "COMPLETE" && signatureValid) {
            try {
                    const booking = await createBookingFromPaymentData(bookingData, bookingData.userId);
                    
                    // Update booking with eSewa transaction details
                    booking.esewaTransactionUuid = transaction_uuid || null;
                    booking.esewaTransactionCode = transaction_code || null;
                    await booking.save();
                    
                    // Send confirmation emails to both user and vendor
                    try {
                        // Populate booking to get user and vehicle details
                        await booking.populate('userId vehicleId');
                        
                        // Get vendor details
                        const vendor = await User.findById(booking.vehicleId.vendorId);
                        
                        // Format dates for email
                        const formatDate = (date) => {
                            return new Date(date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            });
                        };
                        
                        // Format pickup location
                        const pickupLocationStr = booking.pickupLocation 
                            ? `${booking.pickupLocation.street}, ${booking.pickupLocation.city}, ${booking.pickupLocation.state}`
                            : 'N/A';
                        
                        // Send email to user
                        await sendEmail(booking.userId.email, 'booking-confirmation-user', {
                            userName: booking.userId.name,
                            vehicleName: booking.vehicleId.name,
                            startDate: formatDate(booking.startDate),
                            endDate: formatDate(booking.endDate),
                            totalAmount: booking.totalAmount,
                            totalDays: booking.totalDays,
                            pickupLocation: pickupLocationStr,
                            bookingId: booking._id.toString(),
                            vendorContact: vendor?.contact || 'N/A'
                        });
                        
                        // Send email to vendor
                        if (vendor && vendor.email) {
                            await sendEmail(vendor.email, 'booking-confirmation-vendor', {
                                vendorName: vendor.name,
                                vehicleName: booking.vehicleId.name,
                                userName: booking.userId.name,
                                userContact: booking.userId.contact || 'N/A',
                                startDate: formatDate(booking.startDate),
                                endDate: formatDate(booking.endDate),
                                totalAmount: booking.totalAmount,
                                totalDays: booking.totalDays,
                                pickupLocation: pickupLocationStr,
                                bookingId: booking._id.toString()
                            });
                        }
                    } catch (emailError) {
                        console.error('Error sending booking confirmation emails:', emailError);
                    }
                    
                    // Remove from temporary storage
                    pendingBookingData.delete(transaction_uuid);
                    
                    return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/success?bookingId=${booking._id}`);
            
            } catch (createError) {
                console.error("Error creating booking after payment:", createError);
                pendingBookingData.delete(transaction_uuid);
                return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/failed?error=booking_creation_failed`);
            }
        } else if (status === "CANCELED" || status === "FAILURE") {
            pendingBookingData.delete(transaction_uuid);
            return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/cancelled`);
        }
    } catch (error) {
        console.error("Error handling eSewa payment callback:", error);
        return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/failed?error=callback_error`);
    }
};