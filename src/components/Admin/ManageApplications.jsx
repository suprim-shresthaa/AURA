import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:3000/api/vendors/applications';

const ManageApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState(null);

    // Fetch applications
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
            setError('Failed to load applications. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Handle Approve
    const handleApprove = async (id) => {
        if (!window.confirm('Are you sure you want to approve this application?')) return;

        setProcessingId(id);
        try {
            // Replace with your actual approve endpoint
            await axios.post(`http://localhost:3000/api/vendors/approve/${id}`);
            setApplications(prev => prev.filter(app => app._id !== id));
            alert('Application approved successfully!');
        } catch (err) {
            alert('Failed to approve application.');
            console.error(err);
        } finally {
            setProcessingId(null);
        }
    };

    // Handle Reject
    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this application?')) return;

        setProcessingId(id);
        try {
            // Replace with your actual reject endpoint
            await axios.post(`http://localhost:3000/api/vendors/reject/${id}`);
            setApplications(prev => prev.filter(app => app._id !== id));
            alert('Application rejected successfully!');
        } catch (err) {
            alert('Failed to reject application.');
            console.error(err);
        } finally {
            setProcessingId(null);
        }
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

            {applications.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No pending applications</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Applicant
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Business
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID Document
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Submitted
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {applications.map((app) => (
                                <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{app.fullName}</div>
                                            <div className="text-xs text-gray-500 capitalize">{app.businessType}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {app.businessName || (
                                                <span className="text-gray-400 italic">N/A</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{app.email}</div>
                                        <div className="text-sm text-gray-500">{app.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <a
                                            href={app.idDocumentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                                        >
                                            View ID
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {format(new Date(app.createdAt), 'MMM d, yyyy')}
                                        <br />
                                        <span className="text-xs">{format(new Date(app.createdAt), 'h:mm a')}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleApprove(app._id)}
                                                disabled={processingId === app._id}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                {processingId === app._id ? 'Approving...' : 'Approve'}
                                            </button>
                                            <button
                                                onClick={() => handleReject(app._id)}
                                                disabled={processingId === app._id}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                {processingId === app._id ? 'Rejecting...' : 'Reject'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageApplications;