import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axiosInstance";
import { fetchSparePartById, updateSparePart } from "@/data/api";
import Loading from "@/components/Loading";
import {
    Package, Tag, DollarSign, Car, FileText,
    ImagePlus, Plus, Loader2, CheckCircle, XCircle, MapPin
} from "lucide-react";

const categories = [
    "Electrical", "Tires",,
    "Body", "Accessories", "Brakes"
];

const SparePartsForm = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "", category: "", brand: "", rentPrice: "",
        compatibleVehicles: "", description: "", images: [],
        pickupLocation: { address: "", city: "" },
    });

    const [imagePreviews, setImagePreviews] = useState([]);
    const [existingImageUrls, setExistingImageUrls] = useState([]);
    const [loadingPart, setLoadingPart] = useState(!!isEdit);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        (async () => {
            setLoadingPart(true);
            setError("");
            try {
                const part = await fetchSparePartById(id);
                if (!part || cancelled) return;
                setFormData({
                    name: part.name || "",
                    category: part.category || "",
                    brand: part.brand || "",
                    rentPrice: part.rentPrice != null ? String(part.rentPrice) : "",
                    compatibleVehicles: part.compatibleVehicles || "",
                    description: part.description || "",
                    images: [],
                    pickupLocation: {
                        address: part.pickupLocation?.address || "",
                        city: part.pickupLocation?.city || "",
                    },
                });
                setExistingImageUrls(Array.isArray(part.images) ? part.images : []);
            } catch (err) {
                if (!cancelled) {
                    setError(err.response?.data?.message || "Could not load spare part.");
                }
            } finally {
                if (!cancelled) setLoadingPart(false);
            }
        })();
        return () => { cancelled = true; };
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePickupChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            pickupLocation: { ...prev.pickupLocation, [name]: value },
        }));
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

        const addr = formData.pickupLocation.address?.trim();
        const city = formData.pickupLocation.city?.trim();
        if (!addr || !city) {
            setError("Pickup address and city are required.");
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
        data.append("compatibleVehicles", formData.compatibleVehicles);
        data.append("description", formData.description);
        data.append("pickupLocation[address]", addr);
        data.append("pickupLocation[city]", city);

        formData.images.forEach((img) => data.append("images", img));

        try {
            if (isEdit) {
                await updateSparePart(id, data);
                setSuccess(true);
                setTimeout(() => navigate("/admin/spare-parts"), 1200);
            } else {
                await axiosInstance.post("/spare-parts/add", data, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                setSuccess(true);
                setFormData({
                    name: "", category: "", brand: "", rentPrice: "",
                    compatibleVehicles: "", description: "", images: [],
                    pickupLocation: { address: "", city: "" },
                });
                setImagePreviews([]);
                setTimeout(() => setSuccess(false), 5000);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    if (loadingPart) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <Loading />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                        <Package className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        {isEdit ? "Edit Spare Part" : "Add Spare Part"}
                    </h1>
                    <p className="text-gray-600">Fill in the details below</p>
                </div>

                {success && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl flex items-center gap-3">
                        <CheckCircle /> {isEdit ? "Spare part updated!" : "Spare part added successfully!"}
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

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Car size={16} className="inline mr-2" /> Compatible Vehicles
                                    </label>
                                    <input type="text" name="compatibleVehicles" value={formData.compatibleVehicles} onChange={handleChange}
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none"
                                        placeholder="Toyota Corolla 2018-2023, Honda Civic 2020+" />
                                </div>

                                <div className="md:col-span-2">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
                                        <MapPin size={20} className="text-indigo-600" />
                                        Pickup Location
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-3">Where renters collect this part</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
                                            <input
                                                type="text"
                                                name="address"
                                                required
                                                value={formData.pickupLocation.address}
                                                onChange={handlePickupChange}
                                                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none"
                                                placeholder="Full pickup address"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                                            <input
                                                type="text"
                                                name="city"
                                                required
                                                value={formData.pickupLocation.city}
                                                onChange={handlePickupChange}
                                                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none"
                                                placeholder="e.g., Kathmandu"
                                            />
                                        </div>
                                    </div>
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
                                    {isEdit && (
                                        <span className="block text-xs font-normal text-gray-500 mt-1">
                                            Optional: upload new images to replace current ones. Leave empty to keep existing photos.
                                        </span>
                                    )}
                                </label>
                                {existingImageUrls.length > 0 && (
                                    <p className="text-sm text-gray-600 mb-2">Current images</p>
                                )}
                                {existingImageUrls.length > 0 && (
                                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
                                        {existingImageUrls.map((src, i) => (
                                            <div key={`ex-${i}`} className="aspect-square rounded-lg overflow-hidden border">
                                                <img src={src} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-all bg-gray-50">
                                    <input
                                        type="file"
                                        accept="image/jpeg, image/png"
                                        multiple
                                        id="images"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        required={!isEdit}
                                    />
                                    <label htmlFor="images" className="cursor-pointer">
                                        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-3">
                                            <Plus className="text-indigo-600" size={24} />
                                        </div>
                                        <p className="text-gray-600 font-medium">
                                            {isEdit ? "Upload replacement images" : "Click to upload images"}
                                        </p>
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
                                {loading ? (isEdit ? "Saving..." : "Adding...") : isEdit ? "Save changes" : "Add Spare Part"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SparePartsForm;