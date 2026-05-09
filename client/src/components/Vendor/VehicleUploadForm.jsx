import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Upload,
  Car,
  FileImage,
  Calendar,
  FileText,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { AppContent } from "../context/AppContext";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import InputField from "../InputField";
import { Input } from "../ui/input";

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
    rentalFuel: "",
    transmission: "",
    seatingCapacity: "",
    mileage: "",
    rentPerDay: "",
    pickupLocation: {
      address: "",
      city: "",
    },
  });

  const [mainImage, setMainImage] = useState(null);
  const [bluebookImage, setBluebookImage] = useState(null);
  const [extraImages, setExtraImages] = useState([]);
  const [mainPreview, setMainPreview] = useState(null);
  const [bluebookPreview, setBluebookPreview] = useState(null);
  const [extraPreviews, setExtraPreviews] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
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
          rentalFuel:
            vehicle.rentalFuel === "with" || vehicle.rentalFuel === "without"
              ? vehicle.rentalFuel
              : "without",
          transmission: vehicle.transmission || "",
          seatingCapacity: vehicle.seatingCapacity || "",
          mileage: vehicle.mileage || "",
          rentPerDay: vehicle.rentPerDay || "",
          pickupLocation: {
            address: vehicle.pickupLocation?.address || "",
            city: vehicle.pickupLocation?.city || "",
          },
        });
        // Set preview images from existing URLs
        if (vehicle.mainImage) setMainPreview(vehicle.mainImage);
        if (vehicle.bluebook) setBluebookPreview(vehicle.bluebook);
        setExistingImageUrls(
          Array.isArray(vehicle.images) ? vehicle.images : [],
        );
      }
    } catch (err) {
      console.error("Error fetching vehicle:", err);
      toast.error("Failed to load vehicle data. Please try again.");
      navigate("/vendor/listings");
    } finally {
      setFetching(false);
    }
  };

  const CURRENT_YEAR = new Date().getFullYear();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleModelYearChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 4);
    let next = digitsOnly;
    if (digitsOnly.length === 4) {
      const num = Number.parseInt(digitsOnly, 10);
      if (num > CURRENT_YEAR) {
        next = String(CURRENT_YEAR);
      }
    }
    setFormData((prev) => ({ ...prev, modelYear: next }));
  };

  const handleSeatingCapacityChange = (e) => {
    const digit = e.target.value.replace(/\D/g, "").slice(0, 1);
    if (digit !== "" && digit === "0") {
      setFormData((prev) => ({ ...prev, seatingCapacity: "" }));
      return;
    }
    setFormData((prev) => ({ ...prev, seatingCapacity: digit }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      pickupLocation: {
        ...prev.pickupLocation,
        [name]: value,
      },
    }));
  };

  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
  const MAX_EXTRA_IMAGE_COUNT = 10;

  const handleMainImage = (e) => {
    const file = e.target.files?.[0] || null;
    setMainImage(file);
    setMainPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleBluebookImage = (e) => {
    const file = e.target.files?.[0] || null;
    setBluebookImage(file);
    setBluebookPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleExtraImages = (e) => {
    const files = Array.from(e.target.files || []);
    setExtraImages(files);
    setExtraPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleImageError = (err, field) => {
    toast.error(err.message);
    if (field === "mainImage") {
      setMainImage(null);
      setMainPreview(null);
    }
    if (field === "bluebook") {
      setBluebookImage(null);
      setBluebookPreview(null);
    }
    if (field === "images") {
      setExtraImages([]);
      setExtraPreviews([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!userData?.userId) {
      toast.error("Error: You must be logged in to upload a vehicle.");
      setLoading(false);
      return;
    }

    const yearNum = Number.parseInt(String(formData.modelYear), 10);
    if (
      formData.modelYear === "" ||
      !Number.isFinite(yearNum) ||
      yearNum < 2000 ||
      yearNum > CURRENT_YEAR
    ) {
      toast.error(
        `Model year must be between 2000 and ${CURRENT_YEAR} (inclusive).`,
      );
      setLoading(false);
      return;
    }

    const seatsStr = String(formData.seatingCapacity);
    const seatsNum = Number.parseInt(seatsStr, 10);
    if (!/^[1-9]$/.test(seatsStr) || !Number.isFinite(seatsNum)) {
      toast.error("Seating capacity must be a single digit from 1 to 9.");
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
        credentials: "include",
      });

      const result = res.ok
        ? await res.json()
        : { success: false, message: await res.text() };

      if (res.ok && result.success) {
        toast.success(
          isEditMode
            ? "Vehicle updated successfully! Resubmitted for verification."
            : "Vehicle uploaded successfully! It will be reviewed by an admin.",
        );
        if (isEditMode) {
          navigate("/vendor/listings");
        } else {
          resetForm();
        }
      } else {
        toast.error(
          (isEditMode ? "Update" : "Upload") +
            " failed: " +
            (result.message || "Unknown error"),
        );
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Network error. Please try again.");
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
      rentalFuel: "",
      transmission: "",
      seatingCapacity: "",
      mileage: "",
      rentPerDay: "",
      pickupLocation: { address: "", city: "" },
    });
    setMainImage(null);
    setBluebookImage(null);
    setExtraImages([]);
    setMainPreview(null);
    setBluebookPreview(null);
    setExtraPreviews([]);
    setExistingImageUrls([]);
    document
      .querySelectorAll('input[type="file"]')
      .forEach((input) => (input.value = ""));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <Link
        to="/vendor/listings"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft className="w-6 h-6" />
        Back to Listings
      </Link>
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
            <Loader2
              className="animate-spin mx-auto mb-4 text-blue-600"
              size={32}
            />
            <p className="text-gray-600">Loading vehicle data...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      name="name"
                      placeholder="e.g., Toyota Corolla"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  >
                    <option value="">Select category</option>
                    {["Car", "Bike", "Scooter", "Van"].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model Year *
                  </label>
                  <div className="relative">
                    <InputField
                      type="number"
                      name="modelYear"
                      placeholder="e.g., 2018"
                      value={formData.modelYear}
                      onChange={handleModelYearChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition *
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  >
                    <option value="">Select condition</option>
                    {["Excellent", "Good", "Average"].map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Type *
                  </label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  >
                    <option value="">Select fuel type</option>
                    {["Petrol", "Diesel", "Electric", "Hybrid"].map((fuel) => (
                      <option key={fuel} value={fuel}>
                        {fuel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rental fuel *
                  </label>
                  <select
                    name="rentalFuel"
                    value={formData.rentalFuel}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  >
                    <option value="">With or without fuel</option>
                    <option value="with">With fuel (included in rental)</option>
                    <option value="without">Without fuel (renter pays)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transmission *
                  </label>
                  <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  >
                    <option value="">Select transmission</option>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seating Capacity *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="seatingCapacity"
                    placeholder="1–9"
                    maxLength={1}
                    value={formData.seatingCapacity}
                    onChange={handleSeatingCapacityChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    pattern="[1-9]"
                    title="Single digit only (1–9)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mileage (km) *
                  </label>
                  <input
                    type="number"
                    name="mileage"
                    placeholder="e.g., 20"
                    value={formData.mileage}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 2);
                      setFormData({ ...formData, mileage: value });
                    }}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rent Per Day *
                  </label>
                  <div className="relative">
                    <InputField
                      type="number"
                      name="rentPerDay"
                      placeholder="Enter amount"
                      value={formData.rentPerDay}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
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
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Pickup Location *
                  </h3>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <InputField
                    type="text"
                    name="address"
                    placeholder="Full pickup address"
                    value={formData.pickupLocation.address}
                    onChange={handleLocationChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <InputField
                    type="text"
                    name="city"
                    placeholder="e.g., Kathmandu"
                    value={formData.pickupLocation.city}
                    onChange={handleLocationChange}
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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition bg-gray-50">
                    <InputField
                      id="mainImage"
                      name="mainImage"
                      type="file"
                      accept="image/png, image/jpg, image/jpeg"
                      maxSize={MAX_IMAGE_SIZE}
                      onChange={handleMainImage}
                      onError={(err) => handleImageError(err, "mainImage")}
                      className="hidden"
                      required={true}
                      disabled={loading}
                    />
                    <label htmlFor="mainImage" className="cursor-pointer">
                      {mainPreview ? (
                        <img
                          src={mainPreview}
                          alt="Main preview"
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      ) : (
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                          <FileImage className="text-blue-600" size={24} />
                        </div>
                      )}
                      <p className="text-sm text-gray-600 font-medium">
                        {isEditMode
                          ? "Upload replacement main image"
                          : "Click to upload main image"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, JPEG · max 2 MB
                      </p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Bluebook Photo {!isEditMode && "*"}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition bg-gray-50">
                    <InputField
                      id="bluebook"
                      name="bluebook"
                      type="file"
                      accept="image/png, image/jpg, image/jpeg"
                      maxSize={MAX_IMAGE_SIZE}
                      onChange={handleBluebookImage}
                      onError={(err) => handleImageError(err, "bluebook")}
                      className="hidden"
                      required={true}
                      disabled={loading}
                    />
                    <label htmlFor="bluebook" className="cursor-pointer">
                      {bluebookPreview ? (
                        <img
                          src={bluebookPreview}
                          alt="Bluebook preview"
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      ) : (
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                          <FileText className="text-blue-600" size={24} />
                        </div>
                      )}
                      <p className="text-sm text-gray-600 font-medium">
                        {isEditMode
                          ? "Upload replacement bluebook"
                          : "Click to upload bluebook"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, JPEG · max 2 MB
                      </p>
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Additional Images (Optional)
                  </label>
                  {existingImageUrls.length > 0 && (
                    <>
                      <p className="text-sm text-gray-600 mb-2">
                        Current additional images
                      </p>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
                        {existingImageUrls.map((src, i) => (
                          <div
                            key={`existing-${i}`}
                            className="aspect-square rounded-lg overflow-hidden border"
                          >
                            <img
                              src={src}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition bg-gray-50">
                    <InputField
                      id="images"
                      name="images"
                      type="file"
                      accept="image/png, image/jpg, image/jpeg"
                      multiple
                      maxFiles={MAX_EXTRA_IMAGE_COUNT}
                      maxSize={MAX_IMAGE_SIZE}
                      onChange={handleExtraImages}
                      onError={(err) => handleImageError(err, "images")}
                      className="hidden"
                      disabled={loading}
                    />
                    <label htmlFor="images" className="cursor-pointer">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                        <Upload className="text-blue-600" size={24} />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">
                        Upload additional images
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, JPEG · up to {MAX_EXTRA_IMAGE_COUNT} images, 2
                        MB each
                      </p>
                    </label>
                  </div>
                  {extraPreviews.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-6">
                      {extraPreviews.map((src, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-lg overflow-hidden border"
                        >
                          <img
                            src={src}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
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
                    {isEditMode
                      ? "Update & Resubmit Vehicle"
                      : "Upload Vehicle"}
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
