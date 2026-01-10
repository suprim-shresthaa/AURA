import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axiosInstance";
import { AppContent } from "./context/AppContext";
import { toast } from "react-toastify";
import {
    Package,
    Box,
    DollarSign,
    CheckCircle,
    XCircle,
    ArrowLeft,
    ShoppingCart,
    Phone,
    Mail,
    Plus,
    Minus
} from "lucide-react";
import { Button } from "./ui/button";

export default function SparePartDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addItemToCart, isLoggedin } = useContext(AppContent);
    const [sparePart, setSparePart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        const fetchSparePart = async () => {
            try {
                const res = await axiosInstance.get(`/spare-parts/${id}`);
                setSparePart(res.data.data);
                if (res.data.data.images && res.data.data.images.length > 0) {
                    setSelectedImage(res.data.data.images[0]);
                }
            } catch (err) {
                console.error("Error fetching spare part:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSparePart();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading spare part details...</p>
                </div>
            </div>
        );
    }

    if (!sparePart) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl text-gray-600 mb-4">Spare part not found</p>
                    <Button onClick={() => navigate("/spare-parts")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Spare Parts
                    </Button>
                </div>
            </div>
        );
    }

    const handleAddToCart = async () => {
        if (!isLoggedin) {
            toast.error("Please login to add items to cart");
            navigate("/login");
            return;
        }

        if (quantity < 1) {
            toast.error("Please enter a valid quantity");
            return;
        }

        try {
            setAddingToCart(true);
            await addItemToCart(id, quantity);
            toast.success(`${sparePart.name} added to cart!`);
            setQuantity(1);
            // Optionally navigate to cart
            // navigate("/cart");
        } catch (error) {
            const errorMessage = error.response?.data?.message || 
                                error.message ||
                                "Error adding item to cart";
            toast.error(errorMessage);
        } finally {
            setAddingToCart(false);
        }
    };

    const allImages = sparePart.images && sparePart.images.length > 0 ? sparePart.images : [];
    const isInStock = sparePart.isAvailable && sparePart.stock > 0;

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
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => navigate("/spare-parts")}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Spare Parts
                </Button>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">{sparePart.name}</h1>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {sparePart.category}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                            {sparePart.brand}
                        </span>
                        {isInStock ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                In Stock
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" />
                                Out of Stock
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Images & Description */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Main Image Display */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            {allImages.length > 0 ? (
                                <img
                                    src={selectedImage}
                                    alt={sparePart.name}
                                    className="w-full h-[420px] object-cover"
                                />
                            ) : (
                                <div className="w-full h-[420px] flex items-center justify-center bg-gray-100">
                                    <Package className="w-24 h-24 text-gray-400" />
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Images */}
                        {allImages.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                                {allImages.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(img)}
                                        className={`relative bg-white rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md ${
                                            selectedImage === img ? 'ring-2 ring-blue-600' : ''
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
                        {sparePart.description && (
                            <div className="bg-white rounded-lg shadow-sm p-5">
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {sparePart.description}
                                </p>
                            </div>
                        )}

                        {/* Compatible Vehicles */}
                        {sparePart.compatibleVehicles && (
                            <div className="bg-white rounded-lg shadow-sm p-5">
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">Compatible Vehicles</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    {sparePart.compatibleVehicles}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Details Sidebar */}
                    <div className="space-y-4">
                        {/* Pricing Card */}
                        <div className="bg-blue-600 rounded-lg shadow-sm p-5 text-white">
                            <p className="text-sm opacity-90 mb-1">Price</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold">Rs. {sparePart.price.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Specifications Card */}
                        <div className="bg-white rounded-lg shadow-sm p-5">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Product Details</h2>
                            <div className="space-y-0">
                                <InfoItem
                                    icon={Package}
                                    label="Category"
                                    value={sparePart.category}
                                />
                                <InfoItem
                                    icon={Box}
                                    label="Brand"
                                    value={sparePart.brand}
                                />
                                <InfoItem
                                    icon={Box}
                                    label="Stock Available"
                                    value={sparePart.stock}
                                />
                                <InfoItem
                                    icon={isInStock ? CheckCircle : XCircle}
                                    label="Status"
                                    value={isInStock ? "Available" : "Out of Stock"}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {/* Quantity Selector */}
                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <p className="text-sm font-medium text-gray-700 mb-3">Quantity</p>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1 || addingToCart}
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) || 1;
                                            setQuantity(Math.max(1, Math.min(val, sparePart.stock)));
                                        }}
                                        min="1"
                                        max={sparePart.stock}
                                        className="flex-1 text-center px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={() => setQuantity(Math.min(sparePart.stock, quantity + 1))}
                                        disabled={quantity >= sparePart.stock || addingToCart}
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">{sparePart.stock} available</p>
                            </div>

                            <Button
                                onClick={handleAddToCart}
                                disabled={!isInStock || addingToCart}
                                size="lg"
                                className="w-full h-12 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                {addingToCart ? "Adding..." : isInStock ? "Add to Cart" : "Out of Stock"}
                            </Button>

                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full h-12 cursor-pointer"
                                onClick={() => navigate("/cart")}
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                View Cart
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

