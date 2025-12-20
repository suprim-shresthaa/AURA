import React, { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle, Eye, AlertCircle, User } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Loading from "@/components/ui/Loading";

const ManageLicenses = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, action: null });
  const [dialogLoading, setDialogLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchPendingLicenses();
  }, []);

  const fetchPendingLicenses = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get("/admin/licenses/pending");
      if (response.data?.success) {
        setLicenses(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching pending licenses:", err);
      setError("Failed to load pending licenses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openActionDialog = (license, action) => {
    setSelectedLicense(license);
    setActionDialog({ open: true, action });
    setRejectionReason("");
  };

  const closeActionDialog = () => {
    setActionDialog({ open: false, action: null });
    setSelectedLicense(null);
    setDialogLoading(false);
    setRejectionReason("");
  };

  const handleAction = async () => {
    if (!selectedLicense) return;

    setDialogLoading(true);
    try {
      if (actionDialog.action === "approve") {
        const response = await axiosInstance.post(
          `/admin/licenses/${selectedLicense._id}/approve`
        );
        if (response.data?.success) {
          setLicenses((prev) => prev.filter((l) => l._id !== selectedLicense._id));
          closeActionDialog();
        } else {
          alert("Failed to approve license.");
        }
      } else if (actionDialog.action === "reject") {
        if (!rejectionReason.trim()) {
          alert("Please provide a rejection reason.");
          setDialogLoading(false);
          return;
        }
        const response = await axiosInstance.post(
          `/admin/licenses/${selectedLicense._id}/reject`,
          { rejectionReason: rejectionReason.trim() }
        );
        if (response.data?.success) {
          setLicenses((prev) => prev.filter((l) => l._id !== selectedLicense._id));
          closeActionDialog();
        } else {
          alert("Failed to reject license.");
        }
      }
    } catch (err) {
      console.error("Action failed:", err);
      alert(`Failed to ${actionDialog.action} license. ${err.response?.data?.message || ""}`);
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
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Manage License Verifications</h1>
          <p className="text-gray-600">Review and approve/reject pending user licenses</p>
        </div>

        {licenses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Licenses</h3>
                <p className="text-gray-600">All licenses have been reviewed.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {licenses.map((license) => (
              <Card key={license._id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {license.userName}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                          {license.vehicleType} License
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {license.userEmail}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          Uploaded: {new Date(license.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                      Pending
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">User Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{license.userName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{license.userEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vehicle Type:</span>
                          <span className="font-medium">{license.vehicleType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Uploaded:</span>
                          <span className="font-medium">
                            {new Date(license.uploadedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">License Document</h4>
                      <div className="relative">
                        <img
                          src={license.licenseImage}
                          alt={`${license.vehicleType} License`}
                          className="w-full h-64 object-contain bg-gray-50 rounded-lg border"
                        />
                        <a
                          href={license.licenseImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
                        >
                          <Eye size={16} className="text-gray-700" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3 justify-end border-t pt-4">
                    <Button
                      variant="outline"
                      onClick={() => openActionDialog(license, "reject")}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => openActionDialog(license, "approve")}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={actionDialog.open && actionDialog.action === "approve"}
        onClose={closeActionDialog}
        onConfirm={handleAction}
        title="Approve License"
        message={`Are you sure you want to approve the ${selectedLicense?.vehicleType} license for ${selectedLicense?.userName}? They will be able to rent ${selectedLicense?.vehicleType} vehicles.`}
        confirmText="Approve"
        cancelText="Cancel"
        type="success"
        loading={dialogLoading}
      />

      <ConfirmationModal
        isOpen={actionDialog.open && actionDialog.action === "reject"}
        onClose={closeActionDialog}
        onConfirm={handleAction}
        title="Reject License"
        message={
          <div className="space-y-4">
            <p>
              Are you sure you want to reject the {selectedLicense?.vehicleType} license for{" "}
              {selectedLicense?.userName}?
            </p>
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

export default ManageLicenses;

