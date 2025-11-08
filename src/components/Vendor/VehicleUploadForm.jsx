import React, { useContext, useState } from "react";
import { Upload, Car, FileImage, Calendar, Hash, FileText } from "lucide-react";
import { AppContent } from "../context/AppContext";

export default function VehicleUploadForm() {
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        modelYear: "",
        plateNumber: "",
        rentPerDay: "",
        condition: "",
        description: "",
    });

    const [mainImage, setMainImage] = useState(null);
    const [bluebookImage, setBluebookImage] = useState(null);
    const [extraImages, setExtraImages] = useState([]);
    const [mainPreview, setMainPreview] = useState(null);
    const [bluebookPreview, setBluebookPreview] = useState(null);
    const { userData } = useContext(AppContent);

    // Debug: Log userData on mount
    console.log("User Data from Context:", userData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`Input changed: ${name} = ${value}`);
        setFormData({ ...formData, [name]: value });
    };

    const handleMainImage = (e) => {
        const file = e.target.files[0];
        console.log("Main Image Selected:", file?.name);
        setMainImage(file);
        if (file) setMainPreview(URL.createObjectURL(file));
    };

    const handleBluebookImage = (e) => {
        const file = e.target.files[0];
        console.log("Bluebook Image Selected:", file?.name);
        setBluebookImage(file);
        if (file) setBluebookPreview(URL.createObjectURL(file));
    };

    const handleExtraImages = (e) => {
        const files = Array.from(e.target.files);
        console.log("Extra Images Selected:", files.map(f => f.name));
        setExtraImages(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Form Submitted");
        console.log("Form Data:", formData);
        console.log("User ID:", userData?.userId);

        if (!userData?.userId) {
            alert("Error: You must be logged in to upload a vehicle.");
            console.error("User not authenticated. userId missing.");
            return;
        }

        const data = new FormData();

        // Append form fields
        Object.keys(formData).forEach((key) => {
            data.append(key, formData[key]);
            console.log(`Appending field: ${key} = ${formData[key]}`);
        });

        // Append userId
        data.append("userId", userData.userId);
        console.log("Appending userId:", userData.userId);

        // Append images
        if (mainImage) {
            data.append("mainImage", mainImage);
            console.log("Appending mainImage:", mainImage.name);
        } else {
            console.warn("mainImage is missing");
        }

        if (bluebookImage) {
            data.append("bluebook", bluebookImage);
            console.log("Appending bluebook:", bluebookImage.name);
        } else {
            console.warn("bluebook is missing");
        }

        extraImages.forEach((img, i) => {
            data.append("extraImages", img);
            console.log(`Appending extraImage[${i}]:`, img.name);
        });

        // Debug: Log FormData entries (for browser console)
        console.log("Final FormData entries:");
        for (let [key, value] of data.entries()) {
            if (value instanceof File) {
                console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
            } else {
                console.log(`  ${key}: ${value}`);
            }
        }

        const API_URL = "http://localhost:3000/api/vehicles/create";
        // OR use proxy: "/api/vehicles/create" (recommended)

        try {
            console.log(`Making POST request to: ${API_URL}`);
            const res = await fetch(API_URL, {
                method: "POST",
                body: data,
                credentials: "include", // Required for cookies
            });

            console.log("Response received. Status:", res.status, res.statusText);

            // Log headers for debugging
            console.log("Response Headers:", Object.fromEntries(res.headers.entries()));

            let result;
            const contentType = res.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                result = await res.json();
                console.log("Parsed JSON response:", result);
            } else {
                const text = await res.text();
                console.log("Non-JSON response:", text);
                result = { message: text };
            }

            if (res.ok && result.success) {
                alert("Vehicle uploaded successfully!");
                console.log("Success! Vehicle data:", result.data);

                // Reset form
                setFormData({
                    name: "",
                    category: "",
                    modelYear: "",
                    plateNumber: "",
                    rentPerDay: "",
                    condition: "",
                    description: "",
                });
                setMainImage(null);
                setBluebookImage(null);
                setExtraImages([]);
                setMainPreview(null);
                setBluebookPreview(null);
                document.querySelectorAll('input[type="file"]').forEach(input => (input.value = ""));
            } else {
                const errorMsg = result.message || `Server error: ${res.status}`;
                alert("Upload failed: " + errorMsg);
                console.error("Upload failed:", errorMsg);
            }
        } catch (err) {
            console.error("Fetch failed completely:", err);
            console.error("Error name:", err.name);
            console.error("Error message:", err.message);

            if (err.name === "TypeError" && err.message.includes("fetch")) {
                alert("Cannot connect to server. Is the backend running on http://localhost:3000?");
            } else {
                alert("Network error. Check console for details.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                        <Car className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Vehicle</h1>
                    <p className="text-gray-600">Fill in the details to list your vehicle for rent</p>
                </div>

                {/* Form Card */}
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
                                    <option value="Car">Car</option>
                                    <option value="Bike">Bike</option>
                                    <option value="Scooter">Scooter</option>
                                    <option value="Jeep">Jeep</option>
                                    <option value="Van">Van</option>
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
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        required
                                    />
                                    <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="plateNumber"
                                        placeholder="e.g., Ba 2 Cha 1234"
                                        value={formData.plateNumber}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        required
                                    />
                                    <Hash className="absolute left-3 top-3.5 text-gray-400" size={18} />
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
                                    <option value="Excellent">Excellent</option>
                                    <option value="Good">Good</option>
                                    <option value="Average">Average</option>
                                </select>
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
                                    placeholder="Describe your vehicle, including mileage, features, and any special notes..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                                    rows="4"
                                />
                            </div>
                        </div>

                        {/* Images */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Main Vehicle Image *</label>
                                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition cursor-pointer bg-gray-50">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleMainImage}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        required
                                    />
                                    {mainPreview ? (
                                        <img src={mainPreview} alt="Preview" className="w-full h-32 object-cover rounded" />
                                    ) : (
                                        <div className="text-center">
                                            <FileImage className="mx-auto text-gray-400 mb-2" size={32} />
                                            <p className="text-sm text-gray-600">Click to upload main image</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Bluebook Photo *</label>
                                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition cursor-pointer bg-gray-50">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleBluebookImage}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        required
                                    />
                                    {bluebookPreview ? (
                                        <img src={bluebookPreview} alt="Preview" className="w-full h-32 object-cover rounded" />
                                    ) : (
                                        <div className="text-center">
                                            <FileText className="mx-auto text-gray-400 mb-2" size={32} />
                                            <p className="text-sm text-gray-600">Click to upload bluebook</p>
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

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-[1.02] shadow-lg"
                        >
                            <Upload size={20} />
                            Upload Vehicle
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}