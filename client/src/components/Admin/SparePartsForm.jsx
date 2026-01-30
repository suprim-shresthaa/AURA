import React, { useState } from "react";
import axios from "axios";
import {
    Package, Tag, DollarSign, Box, Car, FileText,
    ImagePlus, Plus, Loader2, CheckCircle, XCircle
} from "lucide-react";

const categories = [
    "Engine", "Electrical", "Tires", "Filters",
    "Body", "Accessories", "Brakes", "Suspension"
];

const SparePartsForm = () => {
    const [formData, setFormData] = useState({
        name: "", category: "", brand: "", rentPrice: "", stock: "",
        compatibleVehicles: "", description: "", images: []
    });

    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setFormData({ ...formData, images: files });
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        // Validate that rent price is provided (rental-only)
        if (!formData.rentPrice) {
            setError("Rent Price must be provided");
            setLoading(false);
            return;
        }

        const data = new FormData();
        data.append("name", formData.name);
        data.append("category", formData.category);
        data.append("brand", formData.brand);
        if (formData.rentPrice) {
            data.append("rentPrice", formData.rentPrice);
        }
        data.append("stock", formData.stock);
        data.append("compatibleVehicles", formData.compatibleVehicles);
        data.append("description", formData.description);

        formData.images.forEach((img) => data.append("images", img));

        try {
            const res = await axios.post("http://localhost:5001/api/spare-parts/add", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setSuccess(true);
            setFormData({
                name: "", category: "", brand: "", rentPrice: "", stock: "",
                compatibleVehicles: "", description: "", images: []
            });
            setImagePreviews([]);

            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                        <Package className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Add Spare Part</h1>
                    <p className="text-gray-600">Fill in the details below</p>
                </div>

                {success && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl flex items-center gap-3">
                        <CheckCircle /> Spare part added successfully!
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl flex items-center gap-3">
                        <XCircle /> {error}
                    </div>
                )}

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    <div className="p-8">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* All your input fields - same as original */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Package size={16} className="inline mr-2" /> Part Name *
                                    </label>
                                    <input type="text" name="name" required value={formData.name} onChange={handleChange}
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 transition-all outline-none"
                                        placeholder="e.g., Brake Pad Set" />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Tag size={16} className="inline mr-2" /> Category *
                                    </label>
                                    <select name="category" required value={formData.category} onChange={handleChange}
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none">
                                        <option value="">Select Category</option>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Brand</label>
                                    <input type="text" name="brand" value={formData.brand} onChange={handleChange}
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none"
                                        placeholder="Bosch, Toyota, etc." />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <DollarSign size={16} className="inline mr-2" /> Rent Price (per day) (NPR)
                                    </label>
                                    <input type="number" name="rentPrice" value={formData.rentPrice} onChange={handleChange}
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none"
                                        placeholder="e.g., 500" min="0" step="0.01" />
                                    <p className="text-xs text-gray-500 mt-1">Price per day for renting this part</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Box size={16} className="inline mr-2" /> Stock Quantity *
                                    </label>
                                    <input type="number" name="stock" required value={formData.stock} onChange={handleChange}
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Car size={16} className="inline mr-2" /> Compatible Vehicles
                                    </label>
                                    <input type="text" name="compatibleVehicles" value={formData.compatibleVehicles} onChange={handleChange}
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none"
                                        placeholder="Toyota Corolla 2018-2023, Honda Civic 2020+" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <FileText size={16} className="inline mr-2" /> Description
                                    </label>
                                    <textarea name="description" rows={4} value={formData.description} onChange={handleChange}
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none resize-none"
                                        placeholder="Detailed description..."></textarea>
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    <ImagePlus size={16} className="inline mr-2" /> Product Images
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-all bg-gray-50">
                                    <input type="file" accept="image/*" multiple id="images" className="hidden" onChange={handleImageUpload} />
                                    <label htmlFor="images" className="cursor-pointer">
                                        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-3">
                                            <Plus className="text-indigo-600" size={24} />
                                        </div>
                                        <p className="text-gray-600 font-medium">Click to upload images</p>
                                        <p className="text-sm text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                                    </label>
                                </div>

                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-6">
                                        {imagePreviews.map((src, i) => (
                                            <div key={i} className="aspect-square rounded-lg overflow-hidden border">
                                                <img src={src} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : null}
                                {loading ? "Adding..." : "Add Spare Part"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SparePartsForm;