import React, { useState, useEffect, useContext, useMemo } from "react";
import { FileText, Upload, CheckCircle, XCircle, Clock, AlertCircle, Car } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { AppContent } from "../context/AppContext";
import Loading from "@/components/Loading";
import { toast } from "react-toastify";

const vehicleTypes = ["Car", "Bike", "Scooter", "Van"];

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
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState([]);
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

  const handleVehicleTypeToggle = (type) => {
    setSelectedVehicleTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (selectedVehicleTypes.length === 0 || !licenseImage) {
      toast.error("Please select at least one vehicle type and upload a license image.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      // Append each vehicle type with the same key - backend will parse as array
      selectedVehicleTypes.forEach((type) => {
        formData.append("vehicleTypes", type);
      });
      formData.append("licenseImage", licenseImage);

      const response = await axiosInstance.post("/user/license/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.success) {
        const message = response.data.message || "License uploaded successfully! It will be reviewed by an admin.";
        toast.success(message);
        setShowUploadForm(false);
        setSelectedVehicleTypes([]);
        setLicenseImage(null);
        setPreview(null);
        fetchLicenses();
      } else {
        toast.error(response.data?.message || "Failed to upload license.");
      }
    } catch (err) {
      console.error("Error uploading license:", err);
      toast.error(err.response?.data?.message || "Failed to upload license. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setShowUploadForm(false);
    setSelectedVehicleTypes([]);
    setLicenseImage(null);
    setPreview(null);
  };

  // Group licenses by license ID (same ID = same license entry with multiple vehicle types)
  const groupedLicenses = useMemo(() => {
    const groups = new Map();
    
    licenses.forEach((license) => {
      // Group by license ID since backend expands licenses with multiple vehicleTypes
      const licenseId = license._id;
      
      if (!groups.has(licenseId)) {
        groups.set(licenseId, {
          key: licenseId,
          _id: license._id,
          licenseImage: license.licenseImage,
          uploadedAt: license.uploadedAt,
          status: license.status,
          rejectionReason: license.rejectionReason,
          approvedBy: license.approvedBy,
          approvedAt: license.approvedAt,
          vehicleTypes: [], // Collect all vehicle types for this license
          licenses: [] // Array of expanded license objects (for reference)
        });
      }
      
      const group = groups.get(licenseId);
      
      // Add vehicle type if not already added
      if (license.vehicleType && !group.vehicleTypes.includes(license.vehicleType)) {
        group.vehicleTypes.push(license.vehicleType);
      }
      
      // Add expanded license entry if not already added
      const existingLicense = group.licenses.find(
        l => l._id === license._id && l.vehicleType === license.vehicleType
      );
      
      if (!existingLicense) {
        group.licenses.push(license);
      }
    });
    
    return Array.from(groups.values());
  }, [licenses]);

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
          <button onClick={() => setShowUploadForm(true)} className="bg-primary text-white py-2 px-4 rounded-md flex items-center hover:bg-primary-700 cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Upload License
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {showUploadForm && (
        <div  className="border-2 rounded-lg p-4 flex items-start gap-3">
          <div className="text-lg font-semibold p-2  mb-4">Upload License</div>
          <div className="flex-1">
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Types * (Select one or more)
                </label>
                <div className="space-y-2 border border-gray-300 rounded-lg p-3 bg-gray-50">
                  {availableVehicleTypes.length === 0 ? (
                    <p className="text-sm text-gray-500">All vehicle types already have licenses.</p>
                  ) : (
                    availableVehicleTypes.map((type) => (
                      <label
                        key={type}
                        className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedVehicleTypes.includes(type)}
                          onChange={() => handleVehicleTypeToggle(type)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{type}</span>
                      </label>
                    ))
                  )}
                </div>
                {selectedVehicleTypes.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {selectedVehicleTypes.join(", ")}
                  </p>
                )}
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
                <button
                  type="button"
                  onClick={cancelUpload}
                  disabled={uploading}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
                >
                  Cancel
                </button>
                <button type="submit" disabled={uploading || selectedVehicleTypes.length === 0 || !licenseImage} className="px-4 py-2 bg-primary text-white cursor-pointer rounded-md hover:bg-primary/90 flex items-center">
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
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {licenses.length === 0 && !showUploadForm ? (
        <div className="flex items-center justify-center py-12">
          <div className="pt-6">
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Licenses Uploaded</h3>
              <p className="text-gray-600 mb-4">
                Upload your driving license. You can use the same license image for multiple vehicle types.
              </p>
              {availableVehicleTypes.length > 0 && (
                <button onClick={() => setShowUploadForm(true)} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 flex items-center justify-center mx-auto">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Your First License
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {groupedLicenses.map((group) => {
            const vehicleTypes = group.vehicleTypes || group.licenses.map((l) => l.vehicleType);
            const isMultipleTypes = vehicleTypes.length > 1;
            
            // Get the most recent status (prioritize rejected > pending > approved)
            const getStatusPriority = (status) => {
              if (status === "rejected") return 3;
              if (status === "pending") return 2;
              if (status === "approved") return 1;
              return 0;
            };
            
            const primaryLicense = group.licenses.reduce((prev, curr) => {
              return getStatusPriority(curr.status) > getStatusPriority(prev.status) ? curr : prev;
            });
            
            const statusInfo = statusConfig[primaryLicense.status] || statusConfig.pending;
            const StatusIcon = statusInfo.icon;
            
            // Check if all licenses are rejected
            const allRejected = group.licenses.every(l => l.status === "rejected");
            const rejectedLicenses = group.licenses.filter(l => l.status === "rejected");
            const rejectionReasons = [...new Set(rejectedLicenses.map(l => l.rejectionReason).filter(Boolean))];

            return (
              <div  key={group.key} className="overflow-hidden bg-white shadow sm:rounded-lg p-6">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                    
                      <div>
                        <div className="text-lg font-semibold text-gray-900 mb-10">
                          {isMultipleTypes 
                            ? `License for ${vehicleTypes.length} Vehicle Types` 
                            : `${vehicleTypes[0]} License`}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {vehicleTypes.map((type) => (
                            <span
                              key={type}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium flex items-center gap-1"
                            >
                              <Car className="h-3 w-3" />
                              {type}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Uploaded: {new Date(group.uploadedAt).toLocaleDateString()}
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
                </div>
                <div className="mt-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {rejectionReasons.length > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm font-semibold text-red-900 mb-1">Rejection Reason{rejectionReasons.length > 1 ? "s" : ""}:</p>
                          {rejectionReasons.map((reason, idx) => (
                            <p key={idx} className="text-sm text-red-700">{reason}</p>
                          ))}
                        </div>
                      )}
                      {group.licenses.some(l => l.approvedAt) && (
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">Approved on:</p>
                          <p>{new Date(group.licenses.find(l => l.approvedAt)?.approvedAt).toLocaleString()}</p>
                        </div>
                      )}
                      {isMultipleTypes && (
                        <div className="text-sm text-gray-600">
                          <p className="font-medium mb-2">Status by Vehicle Type:</p>
                          <div className="space-y-1">
                            {group.licenses.map((license) => {
                              const licenseStatusInfo = statusConfig[license.status] || statusConfig.pending;
                              const LicenseStatusIcon = licenseStatusInfo.icon;
                              return (
                                <div key={license._id} className="flex items-center justify-between py-1">
                                  <span className="text-gray-700">{license.vehicleType}:</span>
                                  <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${licenseStatusInfo.className}`}>
                                    <LicenseStatusIcon className="h-3 w-3" />
                                    {licenseStatusInfo.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">License Document:</p>
                      {isMultipleTypes && (
                        <p className="text-xs text-gray-500 mb-2">
                          This license image is used for {vehicleTypes.length} vehicle type{vehicleTypes.length > 1 ? "s" : ""}: {vehicleTypes.join(", ")}
                        </p>
                      )}
                      <div className="relative">
                        <img
                          src={group.licenseImage}
                          alt={`License for ${vehicleTypes.join(", ")}`}
                          className="w-full h-48 object-contain bg-gray-50 rounded-lg border"
                        />
                        <a
                          href={group.licenseImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
                        >
                          <FileText className="h-4 w-4 text-gray-700" />
                        </a>
                      </div>
                    </div>
                  </div>
                  {allRejected && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">
                        Your license was rejected for {rejectedLicenses.length > 1 ? "these vehicle types" : "this vehicle type"}. You can upload a new one.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedVehicleTypes(vehicleTypes);
                          setShowUploadForm(true);
                        }}
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 flex items-center"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Re-upload License
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Licenses;

