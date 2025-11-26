import express from "express";
import { upload } from "../config/cloudinary.js";
import { 
    getVendorApplications, 
    submitVendorApplication, 
    approveVendorApplication, 
    rejectVendorApplication,
    getVendorStats,
    getVendorBookings
} from "../controllers/vendorController.js";
import userAuth from "../middlewares/userAuth.js";
const router = express.Router();

// POST /api/vendors/register
router.post("/register", userAuth, upload.single("idDocument"), submitVendorApplication);
router.get("/applications", getVendorApplications)
router.put("/approve/:appId", approveVendorApplication);
router.put("/reject/:appId", rejectVendorApplication);

// Vendor dashboard routes (require authentication)
router.get("/dashboard/stats", userAuth, getVendorStats);
router.get("/dashboard/bookings", userAuth, getVendorBookings);

export default router;
