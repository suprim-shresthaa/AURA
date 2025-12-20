import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Car,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Gauge,
    DollarSign,
    Fuel,
    Users,
    Settings,
    Package,
    ArrowLeft
} from "lucide-react";
import BookingModal from "./BookingModal";
import { AppContent } from "./context/AppContext";
import { Button } from "./ui/button";

const API_URL = "http://localhost:5001/api/vehicles";

export default function VehicleDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoggedin, userData } = useContext(AppContent);
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState("");
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    const canBook = userData?.role === "user";

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                const res = await axios.get(`${API_URL}/${id}`);
                setVehicle(res.data.data);
                setSelectedImage(res.data.data.mainImage);
            } catch (err) {
                console.error("Error fetching vehicle:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchVehicle();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading vehicle details...</p>
                </div>
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl text-gray-600">Vehicle not found</p>
                </div>
            </div>
        );
    }

    const vendor = vehicle.vendorId;
    const allImages = [vehicle.mainImage, ...(vehicle.images || [])];

    const InfoItem = ({ icon: Icon, label, value }) => (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-2 text-gray-600">
                <Icon className="w-4 h-4" />
                <span className="text-sm">{label}</span>
            </div>
            <span className="text-gray-900 font-semibold text-sm">{value}</span>
        </div>
    );

    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
                {/* Header */}
                                 {/* Back Button */}
                                 <Button
                    variant="ghost"
                    onClick={() => navigate("/vehicles")}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Vehicles
                </Button>
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">{vehicle.name}</h1>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                            {vehicle.category}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                            {vehicle.condition}
                        </span>
                        {vehicle.isAvailable && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                Available Now
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Images & Description */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Main Image Display */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <img
                                src={selectedImage}
                                alt={vehicle.name}
                                className="w-full h-[420px] object-cover"
                            />
                        </div>

                        {/* Thumbnail Images */}
                        {allImages.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                                {allImages.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(img)}
                                        className={`relative bg-white rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md ${selectedImage === img ? 'ring-2 ring-primary' : ''
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`View ${index + 1}`}
                                            className="w-full h-24 object-cover"
                                        />
                                        {selectedImage === img && (
                                            <div className="absolute inset-0"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        <div className="bg-white rounded-lg shadow-sm p-5">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                            <p className="text-gray-700 leading-relaxed">{vehicle.description}</p>
                        </div>

                        {/* Vendor Information */}
                        <div className="bg-white rounded-lg shadow-sm p-5">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Vendor</h2>

                            <div className="flex items-center gap-4">
                                <img
                                    src={vendor.image}
                                    alt={vendor.name}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                />
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900 text-lg">{vendor.name}</p>

                                    <div className="mt-2 space-y-1">
                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                            <Mail className="w-4 h-4" />
                                            <span>{vendor.email}</span>
                                        </div>

                                        {vendor.contact && (
                                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                <Phone className="w-4 h-4" />
                                                <span>{vendor.contact}</span>
                                            </div>
                                        )}

                                        {vendor.address && (
                                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                <MapPin className="w-4 h-4" />
                                                <span>{vendor.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Details Sidebar */}
                    <div className="space-y-4">
                        {/* Pricing Card */}
                        <div className="bg-primary rounded-lg shadow-sm p-5 text-white">
                            <p className="text-sm opacity-90 mb-1">Rental Price</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold">Rs. {vehicle.rentPerDay}</span>
                                <span className="text-sm opacity-90">/day</span>
                            </div>
                        </div>

                        {/* Specifications Card */}
                        <div className="bg-white rounded-lg shadow-sm p-5">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h2>
                            <div className="space-y-0">
                                <InfoItem
                                    icon={Calendar}
                                    label="Model Year"
                                    value={vehicle.modelYear}
                                />
                                <InfoItem
                                    icon={Fuel}
                                    label="Fuel Type"
                                    value={vehicle.fuelType}
                                />
                                <InfoItem
                                    icon={Settings}
                                    label="Transmission"
                                    value={vehicle.transmission}
                                />
                                <InfoItem
                                    icon={Users}
                                    label="Seats"
                                    value={vehicle.seatingCapacity}
                                />
                                <InfoItem
                                    icon={Gauge}
                                    label="Mileage"
                                    value={`${vehicle.mileage} km/l`}
                                />
                            </div>
                        </div>

                        {/* Pickup Location Card */}
                        <div className="bg-white rounded-lg shadow-sm p-5">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Pickup Location</h2>
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg">
                                    <MapPin className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-gray-900 font-medium">{vehicle.pickupLocation.address}</p>
                                    <p className="text-gray-600 text-sm mt-0.5">{vehicle.pickupLocation.city}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        {!isLoggedin ? (
                            <Button
                                onClick={() => navigate("/login")}
                                size="lg"
                                className="w-full h-12 cursor-pointer"
                            >
                                Login to Book
                            </Button>
                        ) : !canBook ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-yellow-800 text-sm font-medium">
                                    Vendors and admins cannot book vehicles.
                                </p>
                            </div>
                        ) : (
                            <Button
                                onClick={() => {
                                    if (!vehicle.isAvailable) {
                                        alert("This vehicle is not available for booking");
                                        return;
                                    }
                                    setIsBookingModalOpen(true);
                                }}
                                disabled={!vehicle.isAvailable}
                                size="lg"
                                className="w-full h-12 cursor-pointer"
                            >
                                {vehicle.isAvailable ? "Book Now" : "Not Available"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {vehicle && (
                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    vehicle={vehicle}
                />
            )}
        </div>
    );
}