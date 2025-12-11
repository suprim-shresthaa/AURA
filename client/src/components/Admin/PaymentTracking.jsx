import React, { useEffect, useState } from "react";
import { Search, Filter, Download, Eye, Calendar, User, CreditCard, DollarSign, CheckCircle, Clock, XCircle } from "lucide-react";
import { fetchAllPayments, fetchPaymentById } from "@/data/api";
import Loading from "@/components/ui/Loading";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const PaymentTracking = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: "all",
        paymentStatus: "all",
        paymentMethod: "all",
        startDate: "",
        endDate: "",
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 20,
    });
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        loadPayments();
    }, [filters, pagination.currentPage]);

    const loadPayments = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchAllPayments({
                ...filters,
                page: pagination.currentPage,
                limit: pagination.itemsPerPage,
                sortBy: "createdAt",
                sortOrder: "desc",
            });
            if (data) {
                setPayments(data.payments || []);
                setPagination(prev => ({
                    ...prev,
                    ...data.pagination,
                }));
            }
        } catch (err) {
            console.error("Error fetching payments:", err);
            setError(err.response?.data?.message || "Failed to load payments");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleViewDetails = async (paymentId) => {
        try {
            const data = await fetchPaymentById(paymentId);
            setSelectedPayment(data);
            setShowDetails(true);
        } catch (err) {
            console.error("Error fetching payment details:", err);
            alert("Failed to load payment details");
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            confirmed: { label: "Confirmed", className: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
            active: { label: "Active", className: "bg-blue-100 text-blue-700", icon: Clock },
            pending: { label: "Pending", className: "bg-amber-100 text-amber-700", icon: Clock },
            completed: { label: "Completed", className: "bg-green-100 text-green-700", icon: CheckCircle },
            cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700", icon: XCircle },
        };
        const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${config.className}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    const getPaymentStatusBadge = (status) => {
        const statusConfig = {
            paid: { label: "Paid", className: "bg-emerald-100 text-emerald-700" },
            pending: { label: "Pending", className: "bg-amber-100 text-amber-700" },
            refunded: { label: "Refunded", className: "bg-gray-100 text-gray-700" },
        };
        const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.className}`}>
                {config.label}
            </span>
        );
    };

    if (loading && payments.length === 0) {
        return (
            <div className="p-8 min-h-screen flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    const stats = {
        total: pagination.totalItems,
        paid: payments.filter(p => p.paymentStatus === "paid").length,
        pending: payments.filter(p => p.paymentStatus === "pending").length,
        totalRevenue: payments
            .filter(p => p.paymentStatus === "paid")
            .reduce((sum, p) => sum + (p.amount || 0), 0),
    };

    return (
        <div className="p-8 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Payment Tracking</h1>
                    <p className="text-sm text-gray-600 mt-1">Monitor and manage all payment transactions</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Payments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Paid</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{stats.paid}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Pending</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Revenue</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalRevenue)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Booking Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange("status", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Payment Status</label>
                                <select
                                    value={filters.paymentStatus}
                                    onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All</option>
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Payment Method</label>
                                <select
                                    value={filters.paymentMethod}
                                    onChange={(e) => handleFilterChange("paymentMethod", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All</option>
                                    <option value="khalti">Khalti</option>
                                    <option value="esewa">eSewa</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payments Table */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Payments</CardTitle>
                                <CardDescription>
                                    Showing {payments.length} of {pagination.totalItems} payments
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vehicle</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment Method</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Booking Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment) => (
                                        <tr key={payment.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{payment.customer?.name || "N/A"}</p>
                                                    <p className="text-xs text-gray-500">{payment.customer?.email || ""}</p>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-sm text-gray-900">{payment.vehicle?.name || "N/A"}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-gray-600 capitalize">{payment.paymentMethod || "N/A"}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {getPaymentStatusBadge(payment.paymentStatus)}
                                            </td>
                                            <td className="py-3 px-4">
                                                {getStatusBadge(payment.bookingStatus)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-sm text-gray-600">{formatDate(payment.createdAt)}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(payment.id)}
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {payments.length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="py-12 text-center">
                                                <p className="text-gray-500">No payments found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                <p className="text-sm text-gray-600">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                        disabled={pagination.currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                        disabled={pagination.currentPage === pagination.totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Payment Details Modal */}
            {showDetails && selectedPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Payment Details</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                                    ×
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Customer Name</p>
                                    <p className="font-medium">{selectedPayment.customer?.name || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium">{selectedPayment.customer?.email || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Vehicle</p>
                                    <p className="font-medium">{selectedPayment.vehicle?.name || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Amount</p>
                                    <p className="font-medium">{formatCurrency(selectedPayment.amount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Payment Method</p>
                                    <p className="font-medium capitalize">{selectedPayment.paymentMethod || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Payment Status</p>
                                    {getPaymentStatusBadge(selectedPayment.paymentStatus)}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Booking Status</p>
                                    {getStatusBadge(selectedPayment.bookingStatus)}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Days</p>
                                    <p className="font-medium">{selectedPayment.totalDays || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Start Date</p>
                                    <p className="font-medium">{formatDate(selectedPayment.startDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">End Date</p>
                                    <p className="font-medium">{formatDate(selectedPayment.endDate)}</p>
                                </div>
                                {selectedPayment.khaltiTransactionId && (
                                    <div>
                                        <p className="text-sm text-gray-600">Khalti Transaction ID</p>
                                        <p className="font-medium text-xs">{selectedPayment.khaltiTransactionId}</p>
                                    </div>
                                )}
                                {selectedPayment.khaltiPidx && (
                                    <div>
                                        <p className="text-sm text-gray-600">Khalti Pidx</p>
                                        <p className="font-medium text-xs">{selectedPayment.khaltiPidx}</p>
                                    </div>
                                )}
                                {selectedPayment.esewaRefId && (
                                    <div>
                                        <p className="text-sm text-gray-600">eSewa Reference ID</p>
                                        <p className="font-medium text-xs">{selectedPayment.esewaRefId}</p>
                                    </div>
                                )}
                                {selectedPayment.esewaTransactionCode && (
                                    <div>
                                        <p className="text-sm text-gray-600">eSewa Transaction Code</p>
                                        <p className="font-medium text-xs">{selectedPayment.esewaTransactionCode}</p>
                                    </div>
                                )}
                                {selectedPayment.esewaTransactionUuid && (
                                    <div>
                                        <p className="text-sm text-gray-600">eSewa Transaction UUID</p>
                                        <p className="font-medium text-xs">{selectedPayment.esewaTransactionUuid}</p>
                                    </div>
                                )}
                            </div>
                            {selectedPayment.pickupLocation && (
                                <div>
                                    <p className="text-sm text-gray-600">Pickup Location</p>
                                    <p className="font-medium">{selectedPayment.pickupLocation}</p>
                                </div>
                            )}
                            {selectedPayment.notes && (
                                <div>
                                    <p className="text-sm text-gray-600">Notes</p>
                                    <p className="font-medium">{selectedPayment.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default PaymentTracking;

