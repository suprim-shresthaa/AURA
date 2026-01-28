import React, { useState, useEffect } from "react";
import { Car, CheckCircle, XCircle, Eye, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Loading from "@/components/Loading";

const ManageVehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, action: null });
  const [dialogLoading, setDialogLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchPendingVehicles();
  }, []);

  const fetchPendingVehicles = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get("/admin/vehicles/pending");
      if (response.data?.success) {
        setVehicles(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching pending vehicles:", err);
      setError("Failed to load pending vehicles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openActionDialog = (vehicle, action) => {
    setSelectedVehicle(vehicle);
    setActionDialog({ open: true, action });
    setRejectionReason("");
  };

  const closeActionDialog = () => {
    setActionDialog({ open: false, action: null });
    setSelectedVehicle(null);
    setDialogLoading(false);
    setRejectionReason("");
  };

  const handleAction = async () => {
    if (!selectedVehicle) return;

    setDialogLoading(true);
    try {
      if (actionDialog.action === "approve") {
        const response = await axiosInstance.post(
          `/admin/vehicles/${selectedVehicle._id}/approve`
        );
        if (response.data?.success) {
          setVehicles((prev) => prev.filter((v) => v._id !== selectedVehicle._id));
          closeActionDialog();
        } else {
          alert("Failed to approve vehicle.");
        }
      } else if (actionDialog.action === "reject") {
        if (!rejectionReason.trim()) {
          alert("Please provide a rejection reason.");
          setDialogLoading(false);
          return;
        }
        const response = await axiosInstance.post(
          `/admin/vehicles/${selectedVehicle._id}/reject`,
          { rejectionReason: rejectionReason.trim() }
        );
        if (response.data?.success) {
          setVehicles((prev) => prev.filter((v) => v._id !== selectedVehicle._id));
          closeActionDialog();
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
      <div className="p-8 min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-red-900 text-lg">Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Manage Vehicle Verifications</h1>
          <p className="text-gray-600">Review and approve/reject pending vehicle listings</p>
        </div>

        {vehicles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="text-center py-12">
              <Car className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Vehicles</h3>
              <p className="text-gray-600">All vehicles have been reviewed.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Vehicle</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Vendor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Price/Day</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle._id} className="hover:bg-blue-50 transition duration-150 group">
                      {/* Vehicle Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0">
                            <img
                              src={vehicle.mainImage}
                              alt={vehicle.name}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{vehicle.name}</div>
                            <div className="text-sm text-slate-500">
                              {vehicle.modelYear} • {vehicle.fuelType}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Vendor */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-900 text-sm">
                            {vehicle.vendorId?.name || "N/A"}
                          </div>
                          <div className="text-xs text-slate-500">{vehicle.vendorId?.email || "N/A"}</div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {vehicle.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">Rs. {vehicle.rentPerDay}</span>
                        <span className="text-slate-500 text-sm">/day</span>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {vehicle.pickupLocation?.city || "N/A"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                          Pending
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/vehicles/${vehicle._id}`)}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openActionDialog(vehicle, "reject")}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            title="Reject Vehicle"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openActionDialog(vehicle, "approve")}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            title="Approve Vehicle"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Stats */}
            {vehicles.length > 0 && (
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between items-center">
                <span className="text-sm text-slate-600">
                  Showing <span className="font-semibold text-slate-900">{vehicles.length}</span> pending vehicle{vehicles.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={actionDialog.open && actionDialog.action === "approve"}
        onClose={closeActionDialog}
        onConfirm={handleAction}
        title="Approve Vehicle"
        message={`Are you sure you want to approve "${selectedVehicle?.name}"? This vehicle will be listed and available for booking.`}
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
            <p>Are you sure you want to reject "{selectedVehicle?.name}"?</p>
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

export default ManageVehicles;

