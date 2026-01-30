import express from "express";
import {
    getAdminStats,
    getAllPayments,
    getPaymentById,
    getPendingVehicles,
    getVehicleById,
    approveVehicle,
    rejectVehicle,
    getPendingLicenses,
    approveLicense,
    rejectLicense
} from "../controllers/adminController.js";
import requireAdmin from "../middlewares/adminAuth.js";

const router = express.Router();

// Admin dashboard stats
router.get("/dashboard/stats", requireAdmin, getAdminStats);

// Payment tracking endpoints
router.get("/payments", requireAdmin, getAllPayments);
router.get("/payments/:id", requireAdmin, getPaymentById);

// Vehicle verification endpoints
router.get("/vehicles/pending", requireAdmin, getPendingVehicles);
router.get("/vehicles/:id", requireAdmin, getVehicleById);
router.post("/vehicles/:id/approve", requireAdmin, approveVehicle);
router.post("/vehicles/:id/reject", requireAdmin, rejectVehicle);

// License management endpoints
router.get("/licenses/pending", requireAdmin, getPendingLicenses);
router.post("/licenses/:licenseId/approve", requireAdmin, approveLicense);
router.post("/licenses/:licenseId/reject", requireAdmin, rejectLicense);

export default router;

