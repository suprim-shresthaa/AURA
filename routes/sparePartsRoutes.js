// routes/sparePart.routes.js

import express from "express";
import { addSparePart, getAllSpareParts } from "../controllers/sparePartController.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Add spare part
router.post("/add", upload.array("images", 10), addSparePart);
router.get("/all", getAllSpareParts);

export default router;
