import express from "express";
import {
    initiateEsewaPayment,
    esewaPaymentCallback,
    checkEsewaPaymentStatus,
    verifyEsewaPayment,
    initiateCartPayment,
    cartPaymentCallback,
    checkCartPaymentStatus
} from "../controllers/paymentController.js";
import userAuth from "../middlewares/userAuth.js";

const router = express.Router();

// eSewa routes for vehicle bookings
// Payment callback doesn't require auth (called by eSewa)
// eSewa can send data via GET or POST
router.get("/esewa/callback", esewaPaymentCallback);
router.post("/esewa/callback", esewaPaymentCallback);

// Payment status check endpoint
router.post("/esewa/status", userAuth, checkEsewaPaymentStatus);

// Payment verification endpoint
router.post("/esewa/verify", userAuth, verifyEsewaPayment);

// Payment initiation requires authentication
router.post("/esewa/initiate", userAuth, initiateEsewaPayment);

// eSewa routes for cart/spare parts orders
router.post("/cart/initiate", userAuth, initiateCartPayment);
router.get("/cart/callback", cartPaymentCallback);
router.post("/cart/callback", cartPaymentCallback);
router.post("/cart/status", userAuth, checkCartPaymentStatus);

export default router;

