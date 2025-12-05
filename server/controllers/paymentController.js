import axios from "axios";
import crypto from "crypto";
import Booking from "../models/booking.model.js";
import Vehicle from "../models/vehicle.model.js";

// Khalti API configuration (Sandbox)
const KHALTI_BASE_URL = "https://dev.khalti.com/api/v2";
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;

// Validate Khalti configuration
if (!KHALTI_SECRET_KEY) {
    console.error("⚠️  WARNING: KHALTI_SECRET_KEY is not set in environment variables!");
    console.error("   Please add KHALTI_SECRET_KEY to your .env file");
}

// eSewa API configuration
const ESEWA_BASE_URL = process.env.ESEWA_BASE_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const ESEWA_STATUS_URL = process.env.ESEWA_STATUS_URL || "https://rc.esewa.com.np/api/epay/transaction/status/";
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";    
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";

// Validate eSewa configuration
if (!ESEWA_SECRET_KEY) {
    console.error("⚠️  WARNING: ESEWA_SECRET_KEY is not set in environment variables!");
    console.error("   Please add ESEWA_SECRET_KEY to your .env file");
}

// Temporary storage for booking data (in production, use Redis or database)
const pendingBookingData = new Map();

/**
 * Generate HMAC SHA256 signature for eSewa
 * According to eSewa docs: HMAC SHA256 with base64 output
 */
const generateEsewaSignature = (data, secretKey) => {
    try {
        // Ensure data is a string
        const dataString = String(data);
        // Ensure secretKey is a string
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

/**
 * Create eSewa signature with specific format
 * @param {Object} params - Payment parameters
 * @param {string} params.total_amount - Total amount (formatted string, must match form value exactly)
 * @param {string} params.transaction_uuid - Transaction UUID
 * @param {string} params.product_code - Product code
 * @returns {string} Base64 encoded HMAC SHA256 signature
 */
function createEsewaSignature({ total_amount, transaction_uuid, product_code }) {
    // Use secret key as-is (don't trim as it might contain important characters)
    const secret = ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
    
    // Ensure all values are strings (trim only the values, not the secret)
    const totalAmountStr = String(total_amount).trim();
    const transactionUuidStr = String(transaction_uuid).trim();
    const productCodeStr = String(product_code).trim();
    
    // Signature must use exact total_amount value as sent in form
    // Format: field_name=value,field_name=value,field_name=value
    // According to eSewa docs, the order and format must match exactly
    const message = `total_amount=${totalAmountStr},transaction_uuid=${transactionUuidStr},product_code=${productCodeStr}`;
    
    // Create HMAC SHA256 signature (same as CryptoJS.HmacSHA256)
    // Node.js crypto.createHmac is equivalent to CryptoJS.HmacSHA256
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(message, 'utf8');
    const signature = hmac.digest('base64');
    
    return signature;
}

/**
 * Helper function to create booking from payment data
 */
const createBookingFromPaymentData = async (bookingData, userId) => {
    const { vehicleId, startDate, endDate, totalDays, rentPerDay, totalAmount, notes, paymentMethod } = bookingData;

    // Get vehicle details
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
        throw new Error("Vehicle not found");
    }

    // Create booking
    const booking = await Booking.create({
        userId,
        vehicleId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalDays,
        rentPerDay,
        totalAmount,
        paymentMethod,
        paymentStatus: "paid",
        bookingStatus: "confirmed",
        pickupLocation: vehicle.pickupLocation,
        notes: notes || "",
        isPaymentDeferred: false
    });

    // Mark vehicle as unavailable
    await Vehicle.findByIdAndUpdate(vehicleId, { isAvailable: false });

    return booking;
};

/**
 * Initiate Khalti payment - booking will be created only after payment succeeds
 */
export const initiateKhaltiPayment = async (req, res) => {
    try {
        // Validate Khalti configuration
        if (!KHALTI_SECRET_KEY) {
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

        const { vehicleId, startDate, endDate, totalDays, rentPerDay, totalAmount, notes } = bookingData;

        // Validate required fields
        if (!vehicleId || !startDate || !endDate || !totalDays || !rentPerDay || !totalAmount) {
            return res.status(400).json({
                success: false,
                message: "All booking fields are required"
            });
        }

        // Get vehicle and user details
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
        const start = new Date(startDate);
        const end = new Date(endDate);
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

        // Validate amount (minimum 10 rupees = 1000 paisa)
        const amountInPaisa = Math.round(totalAmount * 100);
        if (amountInPaisa < 1000) {
            return res.status(400).json({
                success: false,
                message: "Amount must be at least Rs. 10"
            });
        }

        // Create a unique reference ID for this payment (will be used to recreate booking data in callback)
        const paymentReferenceId = `khalti_${Date.now()}_${userId}_${vehicleId}`;
        
        // Encode booking data to pass through payment gateway (include userId)
        const encodedBookingData = Buffer.from(JSON.stringify({
            userId,
            vehicleId,
            startDate,
            endDate,
            totalDays,
            rentPerDay,
            totalAmount,
            notes: notes || "",
            paymentMethod: "khalti"
        })).toString('base64');

        // Get user details for customer_info
        const User = (await import("../models/user.model.js")).default;
        const user = await User.findById(userId);

        // Prepare payment initiation payload
        const paymentPayload = {
            return_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/payment/callback`,
            website_url: process.env.CLIENT_URL || "http://localhost:5173",
            amount: amountInPaisa,
            purchase_order_id: encodedBookingData, // Store booking data in purchase_order_id
            purchase_order_name: `Vehicle Rental - ${vehicle.name}`,
            customer_info: {
                name: user?.name || "Customer",
                email: user?.email || "",
                phone: user?.contact || ""
            },
            amount_breakdown: [
                {
                    label: "Rental Fee",
                    amount: amountInPaisa
                }
            ],
            product_details: [
                {
                    identity: vehicleId,
                    name: vehicle.name,
                    total_price: amountInPaisa,
                    quantity: totalDays,
                    unit_price: Math.round((totalAmount / totalDays) * 100)
                }
            ]
        };

        // Make request to Khalti API
        const response = await axios.post(
            `${KHALTI_BASE_URL}/epayment/initiate/`,
            paymentPayload,
            {
                headers: {
                    Authorization: `Key ${KHALTI_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const { pidx, payment_url } = response.data;

        res.json({
            success: true,
            message: "Payment initiated successfully",
            data: {
                pidx,
                paymentUrl: payment_url,
                paymentReferenceId
            }
        });
    } catch (error) {
        console.error("Error initiating Khalti payment:", error);
        
        // Handle Khalti API errors
        if (error.response) {
            return res.status(error.response.status || 500).json({
                success: false,
                message: error.response.data?.detail || error.response.data?.error_key || "Payment initiation failed",
                error: error.response.data
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || "Failed to initiate payment"
        });
    }
};

/**
 * Handle Khalti payment callback - Create booking only if payment succeeds
 */
export const khaltiPaymentCallback = async (req, res) => {
    try {
        const { pidx, status, transaction_id, amount, purchase_order_id } = req.query;

        if (!pidx) {
            return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/failed?error=missing_pidx`);
        }

        // Decode booking data from purchase_order_id
        let bookingData;
        let userId;
        try {
            const decodedData = Buffer.from(purchase_order_id, 'base64').toString('utf-8');
            bookingData = JSON.parse(decodedData);
            
            // Get userId from the request (we'll need to store it differently)
            // For now, we'll need to get it from the booking data or session
            // Actually, we need to modify the approach - store userId in the encoded data too
        } catch (decodeError) {
            console.error("Error decoding booking data:", decodeError);
            return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/failed?error=invalid_booking_data`);
        }

        // Handle different statuses
        if (status === "Completed") {
            try {
                // Create booking only after successful payment
                const booking = await createBookingFromPaymentData(bookingData, bookingData.userId);
                
                // Update booking with Khalti transaction details
                booking.khaltiPidx = pidx;
                booking.khaltiTransactionId = transaction_id || null;
                await booking.save();
                
                return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/success?bookingId=${booking._id}`);
            } catch (createError) {
                console.error("Error creating booking after payment:", createError);
                return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/failed?error=booking_creation_failed`);
            }
        } else if (status === "User canceled") {
            // Payment cancelled - no booking created
            return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/cancelled`);
        } else {
            // Pending, Expired, or other statuses - no booking created yet
            return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/pending?status=${status}`);
        }
    } catch (error) {
        console.error("Error handling payment callback:", error);
        return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/failed?error=callback_error`);
    }
};

/**
 * Verify Khalti payment using lookup API
 */
export const verifyKhaltiPayment = async (req, res) => {
    try {
        // Validate Khalti configuration
        if (!KHALTI_SECRET_KEY) {
            return res.status(500).json({
                success: false,
                message: "Payment service is not configured. Please contact support."
            });
        }

        const { pidx } = req.body;

        if (!pidx) {
            return res.status(400).json({
                success: false,
                message: "pidx is required"
            });
        }

        // Make lookup request to Khalti API
        const response = await axios.post(
            `${KHALTI_BASE_URL}/epayment/lookup/`,
            { pidx },
            {
                headers: {
                    Authorization: `Key ${KHALTI_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const paymentData = response.data;

        // Find booking by pidx
        const booking = await Booking.findOne({ khaltiPidx: pidx });

        if (!booking) {
            // Booking might not exist if payment verification is called before callback completes
            // or if payment was never completed
            return res.status(404).json({
                success: false,
                message: "Booking not found for this payment. Payment may not have been completed yet.",
                data: {
                    payment: paymentData,
                    booking: null
                }
            });
        }

        // Update booking based on payment status
        if (paymentData.status === "Completed" && booking.paymentStatus !== "paid") {
            booking.paymentStatus = "paid";
            booking.bookingStatus = "confirmed";
            booking.khaltiTransactionId = paymentData.transaction_id;
            booking.isPaymentDeferred = false;
            
            // Mark vehicle as unavailable
            await Vehicle.findByIdAndUpdate(booking.vehicleId, { isAvailable: false });
            await booking.save();
        } else if (paymentData.status === "Refunded") {
            booking.paymentStatus = "refunded";
            await booking.save();
        } else if (paymentData.status === "User canceled" || paymentData.status === "Expired") {
            booking.bookingStatus = "cancelled";
            await booking.save();
        }

        res.json({
            success: true,
            message: "Payment verification completed",
            data: {
                payment: paymentData,
                booking: {
                    id: booking._id,
                    paymentStatus: booking.paymentStatus,
                    bookingStatus: booking.bookingStatus
                }
            }
        });
    } catch (error) {
        console.error("Error verifying payment:", error);
        
        if (error.response) {
            return res.status(error.response.status || 500).json({
                success: false,
                message: error.response.data?.detail || "Payment verification failed",
                error: error.response.data
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || "Failed to verify payment"
        });
    }
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

        const { vehicleId, startDate, endDate, totalDays, rentPerDay, totalAmount, notes } = bookingData;

        // Validate required fields
        if (!vehicleId || !startDate || !endDate || !totalDays || !rentPerDay || !totalAmount) {
            return res.status(400).json({
                success: false,
                message: "All booking fields are required"
            });
        }

        // Get vehicle details
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
        const start = new Date(startDate);
        const end = new Date(endDate);
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

        // Validate amount (minimum 1 rupee)
        if (totalAmount < 1) {
            return res.status(400).json({
                success: false,
                message: "Amount must be at least Rs. 1"
            });
        }

        // Generate unique transaction UUID (will be used to retrieve booking data in callback)
        const transactionUuid = `esewa_${Date.now()}_${userId}_${vehicleId}`;

        // Prepare payment parameters
        // According to eSewa docs, signature format: field_name=value,field_name=value
        // Example: total_amount=100,transaction_uuid=11-201-13,product_code=EPAYTEST
        const signedFieldNames = "total_amount,transaction_uuid,product_code";
        
        // Store booking data temporarily (will be retrieved in callback)
        pendingBookingData.set(transactionUuid, {
            userId,
            vehicleId,
            startDate,
            endDate,
            totalDays,
            rentPerDay,
            totalAmount,
            notes: notes || "",
            paymentMethod: "esewa"
        });
        
        // Format values - ensure they match exactly what's sent in the form
        // total_amount should always have 2 decimal places for eSewa
        const totalAmountFormatted = totalAmount.toFixed(2);
        
        // Generate signature using createEsewaSignature function
        // IMPORTANT: Use the exact formatted total_amount value that will be sent in the form
        const signature = createEsewaSignature({
            total_amount: totalAmountFormatted,
            transaction_uuid: transactionUuid,
            product_code: ESEWA_PRODUCT_CODE
        });
        
        // Debug logging (remove in production)
        console.log("=== eSewa Payment Initiation ===");
        console.log("Amount:", totalAmount);
        console.log("Total Amount (formatted):", totalAmountFormatted);
        console.log("Transaction UUID:", transactionUuid);
        console.log("Product Code:", ESEWA_PRODUCT_CODE);
        console.log("Secret Key:", ESEWA_SECRET_KEY ? "Set" : "Not Set");
        console.log("Secret Key Length:", ESEWA_SECRET_KEY ? ESEWA_SECRET_KEY.length : 0);
        console.log("Signed Field Names:", signedFieldNames);
        console.log("Signature Message:", `total_amount=${totalAmountFormatted},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`);
        console.log("Generated Signature:", signature);
        console.log("Signature Length:", signature.length);
        console.log("================================");

        // Use SERVER_URL if available, otherwise construct from request
        // For eSewa callback, we need a publicly accessible URL with proper protocol
        let serverUrl = process.env.SERVER_URL || process.env.BACKEND_URL;
        
        // If SERVER_URL is not set, try to construct it
        if (!serverUrl) {   
            // Always use backend server URL, not frontend
            // In development, use localhost with backend port
            const backendPort = process.env.PORT || 5001;
            serverUrl = `http://localhost:${backendPort}`;
            
            // In production, you should set SERVER_URL or BACKEND_URL environment variable
            // For now, fallback to localhost (this should be configured properly in production)
            if (process.env.NODE_ENV === 'production') {
                console.warn("⚠️  WARNING: SERVER_URL or BACKEND_URL not set in production!");
                console.warn("   Please set SERVER_URL or BACKEND_URL environment variable.");
            }
        }
        
        // Ensure URL has protocol (http:// or https://)
        if (!serverUrl.startsWith('http://') && !serverUrl.startsWith('https://')) {
            // If no protocol, assume http for localhost, https otherwise
            if (serverUrl.includes('localhost') || serverUrl.includes('127.0.0.1')) {
                serverUrl = `http://${serverUrl}`;
            } else {
                serverUrl = `https://${serverUrl}`;
            }
        }
        
        // Remove trailing slash if present
        serverUrl = serverUrl.replace(/\/$/, '');
        
        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        
        // eSewa callback URL - must be publicly accessible with proper format
        const successUrl = `${serverUrl}/api/payments/esewa/callback`;
        const failureUrl = `${serverUrl}/api/payments/esewa/callback`;
        
        console.log("Callback URLs:", { successUrl, failureUrl });

        // Return payment form data for frontend to submit
        // Note: Booking will be created only after payment succeeds in the callback
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
        console.log("=== eSewa Callback Received ===");
        console.log("Method:", req.method);
        console.log("Query params:", JSON.stringify(req.query, null, 2));
        console.log("Body:", JSON.stringify(req.body, null, 2));
        console.log("Headers:", JSON.stringify(req.headers, null, 2));
        console.log("================================");

        // eSewa can send data via GET (query params) or POST (form data)
        // Try to get data from both sources
        const queryData = req.query || {};
        const bodyData = req.body || {};
        
        // Merge both sources (body takes precedence for POST)
        const callbackData = {
            ...queryData,
            ...bodyData
        };

        // Extract data - handle both standard and alternative field names
        const transaction_code = callbackData.transaction_code || callbackData.ref_id || callbackData.transactionCode;
        const status = callbackData.status || callbackData.Status;
        const total_amount = callbackData.total_amount || callbackData.totalAmount;
        // transaction_uuid is critical - try multiple variations
        const transaction_uuid = callbackData.transaction_uuid || 
                                 callbackData.transactionUuid ||
                                 callbackData.uuid ||
                                 callbackData.transactionUUID;
        const product_code = callbackData.product_code || callbackData.productCode;
        const signed_field_names = callbackData.signed_field_names || callbackData.signedFieldNames;
        const signature = callbackData.signature;

        console.log("Extracted callback data:", {
            transaction_code,
            status,
            total_amount,
            transaction_uuid,
            product_code,
            signed_field_names: signed_field_names ? signed_field_names.substring(0, 50) + "..." : null,
            signature: signature ? signature.substring(0, 20) + "..." : null
        });

        // Try to find transaction_uuid - use fallback if not in callback
        let actualTransactionUuid = transaction_uuid;
        
        if (!actualTransactionUuid) {
            console.error("Missing transaction_uuid in callback data");
            console.error("Available keys in callbackData:", Object.keys(callbackData));
            console.error("Full callbackData:", JSON.stringify(callbackData, null, 2));
            
            // Try to find transaction_uuid in pending bookings by matching other fields
            // This is a fallback if eSewa doesn't send transaction_uuid
            let foundUuid = null;
            if (total_amount && product_code) {
                for (const [uuid, bookingData] of pendingBookingData.entries()) {
                    const expectedTotal = bookingData.totalAmount;
                    if (Math.abs(parseFloat(total_amount) - expectedTotal) < 0.01) {
                        foundUuid = uuid;
                        console.log("Found matching transaction_uuid by amount:", foundUuid);
                        break;
                    }
                }
            }
            
            if (!foundUuid) {
                return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/failed?error=missing_transaction_uuid`);
            }
            
            actualTransactionUuid = foundUuid;
            console.log("Using found transaction_uuid:", actualTransactionUuid);
        }

        // Retrieve booking data from temporary storage
        const bookingData = pendingBookingData.get(actualTransactionUuid);

        if (!bookingData) {
            return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/failed?error=booking_data_not_found`);
        }

        // Verify signature if provided
        // eSewa callback signature format: field_name=value,field_name=value,...
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
                        case "transaction_uuid": fieldValue = actualTransactionUuid || ""; break;
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
                // Verify amount matches (allow small floating point differences)
                if (Math.abs(parseFloat(total_amount) - bookingData.totalAmount) < 0.01) {
                    // Create booking only after successful payment
                    const booking = await createBookingFromPaymentData(bookingData, bookingData.userId);
                    
                    // Update booking with eSewa transaction details
                    booking.esewaTransactionUuid = actualTransactionUuid;
                    booking.esewaTransactionCode = transaction_code || null;
                    booking.esewaRefId = transaction_code || null;
                    await booking.save();
                    
                    // Remove from temporary storage
                    pendingBookingData.delete(actualTransactionUuid);
                    
                    return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/success?bookingId=${booking._id}`);
                } else {
                    // Amount mismatch - potential fraud
                    console.error("Amount mismatch. Expected:", bookingData.totalAmount, "Received:", total_amount);
                    // Remove from temporary storage
                    pendingBookingData.delete(actualTransactionUuid);
                    return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/failed?error=amount_mismatch`);
                }
            } catch (createError) {
                console.error("Error creating booking after payment:", createError);
                // Remove from temporary storage
                pendingBookingData.delete(actualTransactionUuid);
                return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/failed?error=booking_creation_failed`);
            }
        } else if (status === "CANCELED" || status === "FAILURE") {
            // Payment cancelled/failed - no booking created, remove from temp storage
            pendingBookingData.delete(actualTransactionUuid);
            return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/cancelled`);
        } else {
            // Pending or other statuses - keep in temp storage for status check
            return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/pending?status=${status || "PENDING"}&transactionUuid=${actualTransactionUuid}`);
        }
    } catch (error) {
        console.error("Error handling eSewa payment callback:", error);
        return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/failed?error=callback_error`);
    }
};

/**
 * Check eSewa payment status
 */
export const checkEsewaPaymentStatus = async (req, res) => {
    try {
        const { transactionUuid, bookingId } = req.body;

        if (!transactionUuid && !bookingId) {
            return res.status(400).json({
                success: false,
                message: "Transaction UUID or Booking ID is required"
            });
        }

        let booking = null;
        let bookingData = null;
        let uuid = null;
        let totalAmount = null;

        // Try to find existing booking first
        if (bookingId) {
            booking = await Booking.findById(bookingId);
            if (booking && booking.esewaTransactionUuid) {
                uuid = booking.esewaTransactionUuid;
                totalAmount = booking.totalAmount;
            }
        } else {
            // Try to find booking by transaction UUID
            booking = await Booking.findOne({ esewaTransactionUuid: transactionUuid });
            if (booking) {
                uuid = booking.esewaTransactionUuid;
                totalAmount = booking.totalAmount;
            } else {
                // Booking doesn't exist yet, check temporary storage
                bookingData = pendingBookingData.get(transactionUuid);
                if (bookingData) {
                    uuid = transactionUuid;
                    totalAmount = bookingData.totalAmount;
                }
            }
        }

        if (!uuid) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        // Check status from eSewa API
        try {
            const statusResponse = await axios.get(ESEWA_STATUS_URL, {
                params: {
                    product_code: ESEWA_PRODUCT_CODE,
                    total_amount: totalAmount,
                    transaction_uuid: uuid
                }
            });

            const statusData = statusResponse.data;

            // If booking doesn't exist yet and payment is complete, create it
            if (!booking && statusData.status === "COMPLETE" && bookingData) {
                try {
                    booking = await createBookingFromPaymentData(bookingData, bookingData.userId);
                    booking.esewaTransactionUuid = uuid;
                    booking.esewaRefId = statusData.ref_id || null;
                    await booking.save();
                    
                    // Remove from temporary storage
                    pendingBookingData.delete(uuid);
                } catch (createError) {
                    console.error("Error creating booking from status check:", createError);
                    return res.status(500).json({
                        success: false,
                        message: "Payment completed but failed to create booking"
                    });
                }
            }

            // Update booking based on status (only if booking exists)
            if (booking) {
                if (statusData.status === "COMPLETE" && booking.paymentStatus !== "paid") {
                    booking.paymentStatus = "paid";
                    booking.bookingStatus = "confirmed";
                    booking.esewaRefId = statusData.ref_id || null;
                    booking.isPaymentDeferred = false;
                    
                    // Mark vehicle as unavailable
                    await Vehicle.findByIdAndUpdate(booking.vehicleId, { isAvailable: false });
                    await booking.save();
                } else if (statusData.status === "FULL_REFUND" || statusData.status === "PARTIAL_REFUND") {
                    booking.paymentStatus = "refunded";
                    await booking.save();
                } else if (statusData.status === "CANCELED") {
                    booking.bookingStatus = "cancelled";
                    await booking.save();
                } else if (statusData.status === "NOT_FOUND") {
                    // Transaction expired or not found
                    if (bookingData) {
                        // Remove from temp storage if still pending
                        pendingBookingData.delete(uuid);
                    } else {
                        booking.bookingStatus = "cancelled";
                        await booking.save();
                    }
                }
            } else if (statusData.status === "CANCELED" || statusData.status === "NOT_FOUND") {
                // Payment cancelled/not found and no booking exists - clean up temp storage
                if (bookingData) {
                    pendingBookingData.delete(uuid);
                }
            }

            res.json({
                success: true,
                message: "Payment status checked",
                data: {
                    status: statusData.status,
                    refId: statusData.ref_id,
                    booking: booking ? {
                        id: booking._id,
                        paymentStatus: booking.paymentStatus,
                        bookingStatus: booking.bookingStatus
                    } : null
                }
            });
        } catch (apiError) {
            console.error("Error checking eSewa status:", apiError);
            
            if (apiError.response) {
                return res.status(apiError.response.status || 500).json({
                    success: false,
                    message: apiError.response.data?.error_message || "Failed to check payment status",
                    error: apiError.response.data
                });
            }

            res.status(500).json({
                success: false,
                message: "Failed to check payment status"
            });
        }
    } catch (error) {
        console.error("Error checking payment status:", error);
        
        res.status(500).json({
            success: false,
            message: error.message || "Failed to check payment status"
        });
    }
};

/**
 * Verify eSewa payment (for manual verification)
 */
export const verifyEsewaPayment = async (req, res) => {
    try {
        const { transactionUuid, bookingId } = req.body;

        if (!transactionUuid && !bookingId) {
            return res.status(400).json({
                success: false,
                message: "Transaction UUID or Booking ID is required"
            });
        }

        // This is essentially the same as status check, but with verification logic
        return await checkEsewaPaymentStatus(req, res);
    } catch (error) {
        console.error("Error verifying eSewa payment:", error);
        
        res.status(500).json({
            success: false,
            message: error.message || "Failed to verify payment"
        });
    }
};

