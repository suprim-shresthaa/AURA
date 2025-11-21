import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import sparePartRoutes from "./routes/sparePartsRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(
    cors({
        origin: (origin, callback) => {
            callback(null, origin || "*"); // Allow all origins dynamically
        },
        credentials: true, // Allow credentials (cookies, auth headers, etc.)
    })
);
app.use(express.json());
app.use(cookieParser());


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
const db = mongoose.connection;
db.on('error', (error) => console.error('❌ MongoDB Connection Error:', error));
db.once('open', () => console.log('✅ MongoDB Connected Successfully'));


// Routes example
app.get("/", (req, res) => {
    res.send("Server is running and MongoDB is connected!");
});


// Define routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use("/api/vendors", vendorRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/spare-parts", sparePartRoutes);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

