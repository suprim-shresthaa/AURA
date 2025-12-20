import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Car,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Users,
  Settings,
  ArrowLeft,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Loading from "@/components/ui/Loading";

const AdminVehicleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [actionDialog, setActionDialog] = useState({ open: false, action: null });
  const [dialogLoading, setDialogLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get(`/admin/vehicles/${id}`);
      if (response.data?.success) {
        setVehicle(response.data.data);
        setSelectedImage(response.data.data.mainImage);
      } else {
        setError("Failed to load vehicle details.");
      }
    } catch (err) {
      console.error("Error fetching vehicle:", err);
      setError("Failed to load vehicle details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openActionDialog = (action) => {
    setActionDialog({ open: true, action });
    setRejectionReason("");
  };

  const closeActionDialog = () => {
    setActionDialog({ open: false, action: null });
    setDialogLoading(false);
    setRejectionReason("");
  };

  const handleAction = async () => {
    if (!vehicle) return;

    setDialogLoading(true);
    try {
      if (actionDialog.action === "approve") {
        const response = await axiosInstance.post(`/admin/vehicles/${vehicle._id}/approve`);
        if (response.data?.success) {
          navigate("/admin/vehicles");
        } else {
          alert("Failed to approve vehicle.");
        }
      } else if (actionDialog.action === "reject") {
        if (!rejectionReason.trim()) {
          alert("Please provide a rejection reason.");
          setDialogLoading(false);
          return;
        }
        const response = await axiosInstance.post(`/admin/vehicles/${vehicle._id}/reject`, {
          rejectionReason: rejectionReason.trim(),
        });
        if (response.data?.success) {
          navigate("/admin/vehicles");
        } else {
          alert("Failed to reject vehicle.");
        }
      }
    } catch (err) {
      console.error("Action failed:", err);
      alert(`Failed to ${actionDialog.action} vehicle. ${err.response?.data?.message || ""}`);
    } finally {
      setDialogLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <Loading />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">{error || "Vehicle not found"}</p>
          <Button
            variant="outline"
            onClick={() => navigate("/admin/vehicles")}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vehicles
          </Button>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/vehicles")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Manage Vehicles
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{vehicle.name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {vehicle.category}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {vehicle.condition}
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
              Pending Verification
            </span>
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
                    className={`relative bg-white rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md ${
                      selectedImage === img ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <img
                      src={img}
                      alt={`View ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Bluebook Section */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Bluebook Document
              </h2>
              <div className="relative bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-4">
                <img
                  src={vehicle.bluebook}
                  alt="Bluebook"
                  className="w-full h-auto max-h-96 object-contain rounded-lg"
                />
                <a
                  href={vehicle.bluebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-6 right-6 p-3 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                  title="Open in new tab"
                >
                  <Eye className="w-5 h-5 text-gray-700" />
                </a>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed">{vehicle.description || "No description provided."}</p>
            </div>

            {/* Vendor Information */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vendor Information</h2>
              <div className="flex items-center gap-4">
                {vendor?.image && (
                  <img
                    src={vendor.image}
                    alt={vendor.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-lg">{vendor?.name || "N/A"}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Mail className="w-4 h-4" />
                      <span>{vendor?.email || "N/A"}</span>
                    </div>
                    {vendor?.contact && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Phone className="w-4 h-4" />
                        <span>{vendor.contact}</span>
                      </div>
                    )}
                    {vendor?.address && (
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
            <div className="bg-blue-600 rounded-lg shadow-sm p-5 text-white">
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
                <InfoItem icon={Calendar} label="Model Year" value={vehicle.modelYear} />
                <InfoItem icon={Fuel} label="Fuel Type" value={vehicle.fuelType} />
                <InfoItem icon={Settings} label="Transmission" value={vehicle.transmission} />
                <InfoItem icon={Users} label="Seats" value={vehicle.seatingCapacity} />
                {vehicle.mileage && (
                  <InfoItem icon={Gauge} label="Mileage" value={`${vehicle.mileage} km/l`} />
                )}
              </div>
            </div>

            {/* Pickup Location Card */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Pickup Location</h2>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">
                    {vehicle.pickupLocation?.address || "N/A"}
                  </p>
                  <p className="text-gray-600 text-sm mt-0.5">
                    {vehicle.pickupLocation?.city || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm p-5 space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Actions</h2>
              <Button
                onClick={() => openActionDialog("reject")}
                variant="outline"
                className="w-full text-red-600 border-red-300 hover:bg-red-50"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject Vehicle
              </Button>
              <Button
                onClick={() => openActionDialog("approve")}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve Vehicle
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={actionDialog.open && actionDialog.action === "approve"}
        onClose={closeActionDialog}
        onConfirm={handleAction}
        title="Approve Vehicle"
        message={`Are you sure you want to approve "${vehicle?.name}"? This vehicle will be listed and available for booking.`}
        confirmText="Approve"
        cancelText="Cancel"
        type="success"
        loading={dialogLoading}
      />

      <ConfirmationModal
        isOpen={actionDialog.open && actionDialog.action === "reject"}
        onClose={closeActionDialog}
        onConfirm={handleAction}
        title="Reject Vehicle"
        message={
          <div className="space-y-4">
            <p>Are you sure you want to reject "{vehicle?.name}"?</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason (Required):
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={4}
                placeholder="Please provide a reason for rejection..."
                required
              />
            </div>
          </div>
        }
        confirmText="Reject"
        cancelText="Cancel"
        type="danger"
        loading={dialogLoading}
        confirmDisabled={!rejectionReason.trim()}
      />
    </div>
  );
};

export default AdminVehicleDetailsPage;

