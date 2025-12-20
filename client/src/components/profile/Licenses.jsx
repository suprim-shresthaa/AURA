import React, { useState, useEffect, useContext } from "react";
import { FileText, Upload, CheckCircle, XCircle, Clock, AlertCircle, Car } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppContent } from "../context/AppContext";
import Loading from "@/components/ui/Loading";

const vehicleTypes = ["Car", "Bike", "Scooter", "Jeep", "Van"];

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    className: "bg-green-100 text-green-700 border-green-300",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-red-100 text-red-700 border-red-300",
  },
};

const Licenses = () => {
  const { userData } = useContext(AppContent);
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedVehicleType, setSelectedVehicleType] = useState("");
  const [licenseImage, setLicenseImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (userData?.userId) {
      fetchLicenses();
    }
  }, [userData]);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get("/user/license/my-licenses");
      if (response.data?.success) {
        setLicenses(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching licenses:", err);
      setError("Failed to load licenses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLicenseImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedVehicleType || !licenseImage) {
      alert("Please select a vehicle type and upload a license image.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("vehicleType", selectedVehicleType);
      formData.append("licenseImage", licenseImage);

      const response = await axiosInstance.post("/user/license/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.success) {
        alert("License uploaded successfully! It will be reviewed by an admin.");
        setShowUploadForm(false);
        setSelectedVehicleType("");
        setLicenseImage(null);
        setPreview(null);
        fetchLicenses();
      } else {
        alert(response.data?.message || "Failed to upload license.");
      }
    } catch (err) {
      console.error("Error uploading license:", err);
      alert(err.response?.data?.message || "Failed to upload license. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setShowUploadForm(false);
    setSelectedVehicleType("");
    setLicenseImage(null);
    setPreview(null);
  };

  // Get available vehicle types (those without pending/approved licenses)
  const availableVehicleTypes = vehicleTypes.filter(
    (type) => !licenses.some((license) => license.vehicleType === type && license.status !== "rejected")
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Licenses</h2>
          <p className="text-gray-600 mt-1">Manage your driving licenses for different vehicle types</p>
        </div>
        {availableVehicleTypes.length > 0 && !showUploadForm && (
          <Button onClick={() => setShowUploadForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Upload className="mr-2 h-4 w-4" />
            Upload License
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {showUploadForm && (
        <Card>
          <CardHeader>
            <CardTitle>Upload New License</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type *
                </label>
                <select
                  value={selectedVehicleType}
                  onChange={(e) => setSelectedVehicleType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select vehicle type</option>
                  {availableVehicleTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Image *
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                  {preview && (
                    <div className="mt-2">
                      <img
                        src={preview}
                        alt="License preview"
                        className="w-full max-w-md h-64 object-contain border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelUpload}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading || !selectedVehicleType || !licenseImage}>
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload License
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {licenses.length === 0 && !showUploadForm ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Licenses Uploaded</h3>
              <p className="text-gray-600 mb-4">
                Upload your driving licenses to rent vehicles. Each vehicle type requires a separate license.
              </p>
              {availableVehicleTypes.length > 0 && (
                <Button onClick={() => setShowUploadForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Your First License
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {licenses.map((license) => {
            const statusInfo = statusConfig[license.status] || statusConfig.pending;
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={license._id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Car className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{license.vehicleType} License</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Uploaded: {new Date(license.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-semibold border flex items-center gap-2 ${statusInfo.className}`}
                    >
                      <StatusIcon className="h-4 w-4" />
                      {statusInfo.label}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {license.rejectionReason && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm font-semibold text-red-900 mb-1">Rejection Reason:</p>
                          <p className="text-sm text-red-700">{license.rejectionReason}</p>
                        </div>
                      )}
                      {license.approvedAt && (
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">Approved on:</p>
                          <p>{new Date(license.approvedAt).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">License Document:</p>
                      <div className="relative">
                        <img
                          src={license.licenseImage}
                          alt={`${license.vehicleType} License`}
                          className="w-full h-48 object-contain bg-gray-50 rounded-lg border"
                        />
                        <a
                          href={license.licenseImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
                        >
                          <FileText className="h-4 w-4 text-gray-700" />
                        </a>
                      </div>
                    </div>
                  </div>
                  {license.status === "rejected" && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">
                        Your license was rejected. You can upload a new one for this vehicle type.
                      </p>
                      <Button
                        onClick={() => {
                          setSelectedVehicleType(license.vehicleType);
                          setShowUploadForm(true);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Re-upload License
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Licenses;

