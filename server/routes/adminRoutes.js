import express from "express";
import {
    getAdminStats,
    getAllPayments,
    getPaymentById
} from "../controllers/adminController.js";
import requireAdmin from "../middlewares/adminAuth.js";

const router = express.Router();

// Admin dashboard stats
router.get("/dashboard/stats", requireAdmin, getAdminStats);

// Payment tracking endpoints
router.get("/payments", requireAdmin, getAllPayments);
router.get("/payments/:id", requireAdmin, getPaymentById);

export default router;

