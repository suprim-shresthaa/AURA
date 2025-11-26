import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import Vehicle from "../models/vehicle.model.js";
import User from "../models/user.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const vendorBlueprints = [
    {
        name: "Everest Adventure Rentals",
        email: "everest.vendor@aura.com",
        password: "Vendor@123",
        contact: "9800000001",
        address: "Thamel, Kathmandu",
        image: "https://res.cloudinary.com/demo/image/upload/v1730000000/everest_rentals.png"
    },
    {
        name: "Himalayan Urban Rides",
        email: "urban.vendor@aura.com",
        password: "Vendor@123",
        contact: "9800000002",
        address: "Lakeside, Pokhara",
        image: "https://res.cloudinary.com/demo/image/upload/v1730000000/urban_rides.png"
    }
];

const vehicleBlueprints = [
    {
        vendorEmail: "everest.vendor@aura.com",
        name: "Toyota RAV4 AWD",
        category: "Car",
        modelYear: 2022,
        condition: "Excellent",
        description: "Spacious SUV with AWD, perfect for exploring hilly terrain in comfort.",
        fuelType: "Petrol",
        transmission: "Automatic",
        seatingCapacity: 5,
        mileage: 28000,
        rentPerDay: 120,
        pickupLocation: { address: "Tridevi Marg 29", city: "Kathmandu" },
        mainImage: "https://res.cloudinary.com/demo/image/upload/v1730000000/rav4_main.jpg",
        bluebook: "https://res.cloudinary.com/demo/image/upload/v1730000000/rav4_bluebook.jpg",
        images: [
            "https://res.cloudinary.com/demo/image/upload/v1730000000/rav4_side.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1730000000/rav4_interior.jpg"
        ],
        isAvailable: true,
        status: "Active",
        ratings: 4.8
    },
    {
        vendorEmail: "everest.vendor@aura.com",
        name: "Royal Enfield Himalayan",
        category: "Bike",
        modelYear: 2021,
        condition: "Good",
        description: "Iconic adventure bike tuned for Nepal's rugged roads.",
        fuelType: "Petrol",
        transmission: "Manual",
        seatingCapacity: 2,
        mileage: 18000,
        rentPerDay: 55,
        pickupLocation: { address: "Jyatha Road 15", city: "Kathmandu" },
        mainImage: "https://res.cloudinary.com/demo/image/upload/v1730000000/himalayan_main.jpg",
        bluebook: "https://res.cloudinary.com/demo/image/upload/v1730000000/himalayan_bluebook.jpg",
        images: [
            "https://res.cloudinary.com/demo/image/upload/v1730000000/himalayan_side.jpg"
        ],
        isAvailable: true,
        status: "Active",
        ratings: 4.6
    },
    {
        vendorEmail: "urban.vendor@aura.com",
        name: "Kia Carnival Premium",
        category: "Van",
        modelYear: 2023,
        condition: "Excellent",
        description: "Premium MPV ideal for family trips and airport transfers.",
        fuelType: "Diesel",
        transmission: "Automatic",
        seatingCapacity: 7,
        mileage: 12000,
        rentPerDay: 160,
        pickupLocation: { address: "Hallan Chowk 07", city: "Pokhara" },
        mainImage: "https://res.cloudinary.com/demo/image/upload/v1730000000/carnival_main.jpg",
        bluebook: "https://res.cloudinary.com/demo/image/upload/v1730000000/carnival_bluebook.jpg",
        images: [
            "https://res.cloudinary.com/demo/image/upload/v1730000000/carnival_interior.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1730000000/carnival_back.jpg"
        ],
        isAvailable: true,
        status: "Active",
        ratings: 4.9
    },
    {
        vendorEmail: "urban.vendor@aura.com",
        name: "Ather 450X",
        category: "Scooter",
        modelYear: 2024,
        condition: "Excellent",
        description: "Electric scooter with 150 km range, great for eco city rides.",
        fuelType: "Electric",
        transmission: "Automatic",
        seatingCapacity: 2,
        mileage: 6000,
        rentPerDay: 35,
        pickupLocation: { address: "Pame Road 10", city: "Pokhara" },
        mainImage: "https://res.cloudinary.com/demo/image/upload/v1730000000/ather_main.jpg",
        bluebook: "https://res.cloudinary.com/demo/image/upload/v1730000000/ather_bluebook.jpg",
        images: [
            "https://res.cloudinary.com/demo/image/upload/v1730000000/ather_side.jpg"
        ],
        isAvailable: true,
        status: "Active",
        ratings: 4.5
    }
];

const shouldWipe = process.argv.includes("--fresh");

const connectDb = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is missing. Please set it in server/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
};

const ensureVendors = async () => {
    const vendorMap = {};

    for (const blueprint of vendorBlueprints) {
        let vendor = await User.findOne({ email: blueprint.email });
        if (!vendor) {
            const hashedPassword = await bcrypt.hash(blueprint.password, 10);
            vendor = await User.create({
                name: blueprint.name,
                email: blueprint.email,
                password: hashedPassword,
                role: "vendor",
                contact: blueprint.contact,
                address: blueprint.address,
                image: blueprint.image,
                isAccountVerified: true
            });
            console.log(`➕ Created vendor user ${blueprint.email}`);
        } else {
            console.log(`ℹ️  Vendor user ${blueprint.email} already exists. Skipping creation.`);
        }
        vendorMap[blueprint.email] = vendor;
    }

    return vendorMap;
};

const seedVehicles = async (vendorsByEmail) => {
    if (shouldWipe) {
        await Vehicle.deleteMany({});
        console.log("🧹 Cleared existing vehicles collection");
    }

    const results = [];
    for (const vehicle of vehicleBlueprints) {
        const vendor = vendorsByEmail[vehicle.vendorEmail];
        if (!vendor) {
            console.warn(`⚠️  Skipping ${vehicle.name}, vendor ${vehicle.vendorEmail} not found.`);
            continue;
        }

        const upserted = await Vehicle.findOneAndUpdate(
            { name: vehicle.name, vendorId: vendor._id },
            {
                $set: {
                    ...vehicle,
                    vendorId: vendor._id
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        results.push(upserted);
        console.log(`🚗 Seeded vehicle ${vehicle.name}`);
    }

    return results;
};

const run = async () => {
    try {
        await connectDb();
        const vendorsByEmail = await ensureVendors();
        const seededVehicles = await seedVehicles(vendorsByEmail);

        console.log("🎉 Seeding complete:");
        seededVehicles.forEach((vehicle) => {
            console.log(`   • ${vehicle.name} -> ${vehicle.vendorId}`);
        });
        console.log("\nVendor login password (all): Vendor@123");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log("🛑 Disconnected from MongoDB");
    }
};

run();

