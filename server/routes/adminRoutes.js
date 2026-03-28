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
    rejectLicense,
    getAllSparePartsAdmin,
    toggleSparePartAvailability,
    getAllUsers,
    getAllDeletedUsers,
    getUserByIdAdmin
} from "../controllers/adminController.js";
import requireAdmin from "../middlewares/adminAuth.js";
import { banUser, deleteUser, unbanUser } from "../controllers/adminController.js";

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

// Spare parts management endpoints
router.get("/spare-parts", requireAdmin, getAllSparePartsAdmin);
router.put("/spare-parts/:id/availability", requireAdmin, toggleSparePartAvailability);

// Admin actions on users
router.get("/users/:id", requireAdmin, getUserByIdAdmin);
router.post('/ban/:id', requireAdmin, banUser);
router.post('/unban/:id', requireAdmin, unbanUser);
router.delete('/:id', requireAdmin, deleteUser);

router.get('/all-users', requireAdmin, getAllUsers);
router.get('/deleted-users', requireAdmin, getAllDeletedUsers);

export default router;

