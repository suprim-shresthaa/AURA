import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";

import axiosInstance from "@/lib/axiosInstance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

const statusTokens = {
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-700",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700",
  },
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700",
  },
};

const ManageApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState({ id: null, action: null });
  const [actionDialog, setActionDialog] = useState({ open: false, action: null, app: null });
  const [dialogLoading, setDialogLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const summary = useMemo(() => {
    return applications.reduce(
      (acc, app) => ({
        ...acc,
        [app.status]: (acc[app.status] ?? 0) + 1,
      }),
      { pending: 0, approved: 0, rejected: 0 },
    );
  }, [applications]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/vendors/applications");
      if (response.data?.success) {
        setApplications(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openActionDialog = (app, action) => {
    setActionDialog({ open: true, action, app });
    setRejectionReason("");
  };

  const closeActionDialog = () => {
    setActionDialog({ open: false, action: null, app: null });
    setDialogLoading(false);
    setRejectionReason("");
  };

  const handleStatusChange = async (appId, action, reason) => {
    setProcessing({ id: appId, action });

    try {
      const endpoint = `/vendors/${action}/${appId}`;
      const payload = action === "reject" ? { rejectionReason: reason } : {};
      const res = await axiosInstance.put(endpoint, payload);

      if (res.data?.success) {
        setApplications((prev) =>
          prev.map((app) =>
            app._id === appId ? { ...app, ...res.data.data } : app,
          ),
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error(`${action} failed:`, err);
      alert(`Failed to ${action} application.`);
      return false;
    } finally {
      setProcessing({ id: null, action: null });
    }
  };

  const confirmAction = async () => {
    if (!actionDialog.app || !actionDialog.action) return;

    const reason = actionDialog.action === "reject" ? rejectionReason.trim() : undefined;
    setDialogLoading(true);
    const success = await handleStatusChange(actionDialog.app._id, actionDialog.action, reason);
    setDialogLoading(false);

    if (success) {
      closeActionDialog();
    }
  };

  const renderStatusBadge = (status) => {
    const token = statusTokens[status] ?? statusTokens.pending;
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${token.className}`}>
        {token.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 flex items-center rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
        <AlertCircle className="mr-2 h-5 w-5" />
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Manage Vendor Applications</CardTitle>
          <CardDescription>
            Review vendor submissions and approve or reject them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Object.entries(summary).map(([key, value]) => (
              <div key={key} className="rounded-lg border bg-muted/40 p-4">
                <span className="text-xs uppercase text-muted-foreground">{key}</span>
                <p className="text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Applicant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Business
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {applications.map((app) => {
              const disabled = app.status !== "pending";
              const isProcessing = processing.id === app._id;
              const isProcessingApprove = isProcessing && processing.action === "approve";
              const isProcessingReject = isProcessing && processing.action === "reject";

              return (
                <tr key={app._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{app.fullName}</div>
                    <div className="text-xs capitalize text-gray-500">{app.businessType}</div>
                  </td>

                  <td className="px-6 py-4">{app.businessName || "N/A"}</td>

                  <td className="px-6 py-4">
                    <div className="text-sm">{app.email}</div>
                    <div className="text-sm text-gray-500">{app.phone}</div>
                  </td>

                  <td className="px-6 py-4">
                    <a
                      href={app.idDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View ID
                    </a>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {format(new Date(app.createdAt), "MMM d, yyyy")}
                    <br />
                    <span className="text-xs">{format(new Date(app.createdAt), "h:mm a")}</span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {renderStatusBadge(app.status)}
                      {app.status === "rejected" && app.rejectionReason && (
                        <p className="text-xs text-red-600">Reason: {app.rejectionReason}</p>
                      )}
                    </div>
                  </td>

                  <td className="flex space-x-2 px-6 py-4 text-sm font-medium">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={disabled || isProcessing}
                      onClick={() => openActionDialog(app, "approve")}
                    >
                      {disabled
                        ? app.status === "approved"
                          ? "Approved"
                          : "Approve"
                        : isProcessingApprove
                          ? "Approving..."
                          : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={disabled || isProcessing}
                      onClick={() => openActionDialog(app, "reject")}
                    >
                      {disabled
                        ? app.status === "rejected"
                          ? "Rejected"
                          : "Reject"
                        : isProcessingReject
                          ? "Rejecting..."
                          : "Reject"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ConfirmationModal
        isOpen={actionDialog.open}
        onClose={closeActionDialog}
        onConfirm={confirmAction}
        title={
          actionDialog.action === "approve"
            ? "Approve Vendor Application"
            : "Reject Vendor Application"
        }
        message={
          actionDialog.action === "approve"
            ? `Are you sure you want to approve ${actionDialog.app?.fullName}'s application? They will immediately gain vendor access.`
            : `Please provide a reason for rejecting ${actionDialog.app?.fullName}'s application. The applicant will receive an email with your notes.`
        }
        confirmText={actionDialog.action === "approve" ? "Approve" : "Reject"}
        cancelText="Cancel"
        type={actionDialog.action === "approve" ? "info" : "danger"}
        loading={dialogLoading}
        confirmDisabled={actionDialog.action === "reject" && !rejectionReason.trim()}
      >
        {actionDialog.action === "reject" && (
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="rejectionReason">
              Rejection reason
            </label>
            <textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              rows={4}
              placeholder="Explain why the application is being rejected..."
            />
            <p className="text-xs text-gray-500">The applicant will receive this reason via email.</p>
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
};

export default ManageApplications;
