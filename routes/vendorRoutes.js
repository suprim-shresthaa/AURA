import express from "express";
import { upload } from "../config/cloudinary.js";
import { getVendorApplications, submitVendorApplication, approveVendorApplication, rejectVendorApplication } from "../controllers/vendorController.js";
import userAuth from "../middlewares/userAuth.js";
const router = express.Router();

// POST /api/vendors/register
router.post("/register", userAuth, upload.single("idDocument"), submitVendorApplication);
router.get("/applications", getVendorApplications)
router.put("/approve/:appId", approveVendorApplication);
router.put("/reject/:appId", rejectVendorApplication);

export default router;
