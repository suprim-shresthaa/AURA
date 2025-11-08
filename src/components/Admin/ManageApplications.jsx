import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const API_URL = "http://localhost:3000/api/vendors/applications";

const ManageApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL);
            if (response.data.success) {
                setApplications(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching applications:", err);
            setError("Failed to load applications. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (appId) => {
        if (!window.confirm("Approve this application?")) return;

        setProcessingId(appId);
        try {
            const endpoint = `http://localhost:3000/api/vendors/approve/${appId}`;
            console.log("Sending APPROVE request:", { endpoint });

            const res = await axios.put(endpoint);
            console.log("Approve API response:", res.data);

            if (res.data.success) {
                setApplications(prev =>
                    prev.map(app =>
                        app._id === appId ? { ...app, status: "approved" } : app
                    )
                );
                alert("Application approved successfully!");
            }
        } catch (err) {
            console.error("Approve failed:", err);
            alert("Failed to approve.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (appId) => {
        if (!window.confirm("Reject this application?")) return;

        setProcessingId(appId);
        try {
            const endpoint = `http://localhost:3000/api/vendors/reject/${appId}`;
            console.log("Sending REJECT request:", { endpoint });

            const res = await axios.put(endpoint);
            console.log("Reject API response:", res.data);

            if (res.data.success) {
                setApplications(prev =>
                    prev.map(app =>
                        app._id === appId ? { ...app, status: "rejected" } : app
                    )
                );
                alert("Application rejected successfully!");
            }
        } catch (err) {
            console.error("Reject failed:", err);
            alert("Failed to reject.");
        } finally {
            setProcessingId(null);
        }
    };

    const renderStatusBadge = (status) => {
        const base = "px-2 py-1 rounded text-xs font-semibold";
        if (status === "approved") return <span className={`${base} bg-green-100 text-green-700`}>Approved</span>;
        if (status === "rejected") return <span className={`${base} bg-red-100 text-red-700`}>Rejected</span>;
        return <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Manage Vendor Applications</h1>
                <p className="text-gray-600 mt-1">Review and take action on pending vendor applications</p>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {applications.map(app => (
                            <tr key={app._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{app.fullName}</div>
                                    <div className="text-xs text-gray-500 capitalize">{app.businessType}</div>
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
                                        className="text-blue-600 hover:text-blue-800 text-sm"
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
                                    {renderStatusBadge(app.status)}
                                </td>

                                <td className="px-6 py-4 text-sm font-medium flex space-x-2">
                                    <button
                                        onClick={() => handleApprove(app._id)}
                                        disabled={processingId === app._id}
                                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs disabled:opacity-50"
                                    >
                                        {processingId === app._id ? "Approving..." : "Approve"}
                                    </button>

                                    <button
                                        onClick={() => handleReject(app._id)}
                                        disabled={processingId === app._id}
                                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs disabled:opacity-50"
                                    >
                                        {processingId === app._id ? "Rejecting..." : "Reject"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
        </div>
    );
};

export default ManageApplications;
