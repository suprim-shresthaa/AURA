import express from "express";
import { 
    createBooking, 
    getUserBookings, 
    getBookingById, 
    checkAvailability
} from "../controllers/bookingController.js";
import userAuth from "../middlewares/userAuth.js";

const router = express.Router();

// Public route - doesn't require authentication
router.get("/check-availability", checkAvailability);

// All other booking routes require authentication
router.use(userAuth);

router.post("/create", createBooking);
router.get("/my-bookings", getUserBookings);
router.get("/:id", getBookingById);
export default router;

