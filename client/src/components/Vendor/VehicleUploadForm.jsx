import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, Car, FileImage, Calendar, FileText, Loader2 } from "lucide-react";
import { AppContent } from "../context/AppContext";
import axiosInstance from "@/lib/axiosInstance";

export default function VehicleUploadForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        modelYear: "",
        condition: "",
        description: "",
        fuelType: "",
        transmission: "",
        seatingCapacity: "",
        mileage: "",
        rentPerDay: "",
        pickupLocation: {
            address: "",
            city: ""
        }
    });

    const [mainImage, setMainImage] = useState(null);
    const [bluebookImage, setBluebookImage] = useState(null);
    const [extraImages, setExtraImages] = useState([]);
    const [mainPreview, setMainPreview] = useState(null);
    const [bluebookPreview, setBluebookPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const { userData } = useContext(AppContent);

    // Fetch vehicle data if editing
    useEffect(() => {
        if (isEditMode && id) {
            fetchVehicleData();
        }
    }, [id, isEditMode]);

    const fetchVehicleData = async () => {
        try {
            setFetching(true);
            const response = await axiosInstance.get(`/vehicles/${id}`);
            if (response.data?.success && response.data.data) {
                const vehicle = response.data.data;
                setFormData({
                    name: vehicle.name || "",
                    category: vehicle.category || "",
                    modelYear: vehicle.modelYear || "",
                    condition: vehicle.condition || "",
                    description: vehicle.description || "",
                    fuelType: vehicle.fuelType || "",
                    transmission: vehicle.transmission || "",
                    seatingCapacity: vehicle.seatingCapacity || "",
                    mileage: vehicle.mileage || "",
                    rentPerDay: vehicle.rentPerDay || "",
                    pickupLocation: {
                        address: vehicle.pickupLocation?.address || "",
                        city: vehicle.pickupLocation?.city || ""
                    }
                });
                // Set preview images from existing URLs
                if (vehicle.mainImage) setMainPreview(vehicle.mainImage);
                if (vehicle.bluebook) setBluebookPreview(vehicle.bluebook);
            }
        } catch (err) {
            console.error("Error fetching vehicle:", err);
            alert("Failed to load vehicle data. Please try again.");
            navigate("/vendor/listings");
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            pickupLocation: {
                ...prev.pickupLocation,
                [name]: value
            }
        }));
    };

    const handleMainImage = (e) => {
        const file = e.target.files[0];
        setMainImage(file);
        if (file) setMainPreview(URL.createObjectURL(file));
    };

    const handleBluebookImage = (e) => {
        const file = e.target.files[0];
        setBluebookImage(file);
        if (file) setBluebookPreview(URL.createObjectURL(file));
    };

    const handleExtraImages = (e) => {
        const files = Array.from(e.target.files);
        setExtraImages(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!userData?.userId) {
            alert("Error: You must be logged in to upload a vehicle.");
            setLoading(false);
            return;
        }

        const data = new FormData();

        // Append all form fields
        Object.keys(formData).forEach((key) => {
            if (key === "pickupLocation") {
                Object.keys(formData.pickupLocation).forEach((locKey) => {
                    const value = formData.pickupLocation[locKey];
                    if (value !== "") {
                        data.append(`pickupLocation[${locKey}]`, value);
                    }
                });
            } else {
                data.append(key, formData[key]);
            }
        });

        // Append vendorId (from user context)
        data.append("vendorId", userData.userId);

        // Append images (only if new files are selected)
        if (mainImage) data.append("mainImage", mainImage);
        if (bluebookImage) data.append("bluebook", bluebookImage);
        extraImages.forEach((img) => data.append("images", img));

        try {
            const url = isEditMode 
                ? `http://localhost:5001/api/vehicles/${id}`
                : "http://localhost:5001/api/vehicles/create";
            const method = isEditMode ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                body: data,
                credentials: "include"
            });

            const result = res.ok ? await res.json() : { success: false, message: await res.text() };

            if (res.ok && result.success) {
                alert(isEditMode ? "Vehicle updated successfully! Resubmitted for verification." : "Vehicle uploaded successfully!");
                if (isEditMode) {
                    navigate("/vendor/listings");
                } else {
                    resetForm();
                }
            } else {
                alert((isEditMode ? "Update" : "Upload") + " failed: " + (result.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            category: "",
            modelYear: "",
            condition: "",
            description: "",
            fuelType: "",
            transmission: "",
            seatingCapacity: "",
            mileage: "",
            rentPerDay: "",
            pickupLocation: { address: "", city: "" }
        });
        setMainImage(null);
        setBluebookImage(null);
        setExtraImages([]);
        setMainPreview(null);
        setBluebookPreview(null);
        document.querySelectorAll('input[type="file"]').forEach(input => (input.value = ""));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                        <Car className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isEditMode ? "Edit Vehicle" : "Add New Vehicle"}
                    </h1>
                    <p className="text-gray-600">
                        {isEditMode 
                            ? "Update your vehicle details and resubmit for verification" 
                            : "Fill in the details to list your vehicle for rent"}
                    </p>
                </div>

                {fetching ? (
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
                        <p className="text-gray-600">Loading vehicle data...</p>
                    </div>
                ) : (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="e.g., Toyota Corolla"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        required
                                    />
                                    <Car className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    required
                                >
                                    <option value="">Select category</option>
                                    {["Car", "Bike", "Scooter", "Jeep", "Van"].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Model Year</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="modelYear"
                                        placeholder="e.g., 2018"
                                        value={formData.modelYear}
                                        onChange={handleChange}
                                        min="1900"
                                        max={new Date().getFullYear() + 1}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        required
                                    />
                                    <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                                <select
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    required
                                >
                                    <option value="">Select condition</option>
                                    {["Excellent", "Good", "Average"].map(cond => (
                                        <option key={cond} value={cond}>{cond}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                                <select
                                    name="fuelType"
                                    value={formData.fuelType}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    required
                                >
                                    <option value="">Select fuel type</option>
                                    {["Petrol", "Diesel", "Electric", "Hybrid"].map(fuel => (
                                        <option key={fuel} value={fuel}>{fuel}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
                                <select
                                    name="transmission"
                                    value={formData.transmission}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    required
                                >
                                    <option value="">Select transmission</option>
                                    <option value="Manual">Manual</option>
                                    <option value="Automatic">Automatic</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Seating Capacity</label>
                                <input
                                    type="number"
                                    name="seatingCapacity"
                                    placeholder="e.g., 5"
                                    value={formData.seatingCapacity}
                                    onChange={handleChange}
                                    min="1"
                                    max="50"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mileage (km)</label>
                                <input
                                    type="number"
                                    name="mileage"
                                    placeholder="e.g., 45000"
                                    value={formData.mileage}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rent Per Day</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="rentPerDay"
                                        placeholder="Enter amount"
                                        value={formData.rentPerDay}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        required
                                    />
                                    <span className="absolute left-4 top-3.5 text-gray-500 font-medium">NPR</span>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    placeholder="Describe your vehicle, including features, condition, and any special notes..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                                    rows="4"
                                />
                            </div>
                        </div>

                        {/* Pickup Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Pickup Location</h3>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Full pickup address"
                                    value={formData.pickupLocation.address}
                                    onChange={handleLocationChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="e.g., Kathmandu"
                                    value={formData.pickupLocation.city}
                                    onChange={handleLocationChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    required
                                />
                            </div>
                        </div>

                        {/* Images */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Main Vehicle Image {!isEditMode && "*"}
                                </label>
                                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition cursor-pointer bg-gray-50">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleMainImage}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        required={!isEditMode}
                                        disabled={loading}
                                    />
                                    {mainPreview ? (
                                        <img src={mainPreview} alt="Main preview" className="w-full h-32 object-cover rounded" />
                                    ) : (
                                        <div className="text-center">
                                            <FileImage className="mx-auto text-gray-400 mb-2" size={32} />
                                            <p className="text-sm text-gray-600">
                                                {isEditMode ? "Click to change main image (optional)" : "Click to upload main image"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Bluebook Photo {!isEditMode && "*"}
                                </label>
                                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition cursor-pointer bg-gray-50">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleBluebookImage}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        required={!isEditMode}
                                        disabled={loading}
                                    />
                                    {bluebookPreview ? (
                                        <img src={bluebookPreview} alt="Bluebook preview" className="w-full h-32 object-cover rounded" />
                                    ) : (
                                        <div className="text-center">
                                            <FileText className="mx-auto text-gray-400 mb-2" size={32} />
                                            <p className="text-sm text-gray-600">
                                                {isEditMode ? "Click to change bluebook (optional)" : "Click to upload bluebook"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-3">Additional Images (Optional)</label>
                                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition cursor-pointer bg-gray-50">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleExtraImages}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={loading}
                                    />
                                    <div className="text-center">
                                        <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                                        <p className="text-sm text-gray-600">Click to upload multiple images</p>
                                        {extraImages.length > 0 && (
                                            <p className="text-sm text-blue-600 mt-2">{extraImages.length} file(s) selected</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition transform hover:scale-[1.02] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    {isEditMode ? "Updating..." : "Uploading..."}
                                </>
                            ) : (
                                <>
                                    <Upload size={20} />
                                    {isEditMode ? "Update & Resubmit Vehicle" : "Upload Vehicle"}
                                </>
                            )}
                        </button>
                    </form>
                </div>
                )}
            </div>
        </div>
    );
}