import React, { useEffect, useState } from "react";
import {
    Users,
    Calendar,
    Wrench,
    Car,
    TrendingUp,
    DollarSign,
    CreditCard,
    CheckCircle,
    Clock,
    XCircle,
} from "lucide-react";
import { fetchAdminStats } from "@/data/api";
import Loading from "@/components/ui/Loading";

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadStats = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchAdminStats();
                setStats(data);
            } catch (err) {
                console.error("Error fetching admin stats:", err);
                setError(err.response?.data?.message || "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) {
        return (
            <div className="p-8 min-h-screen flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-2">Error loading dashboard</p>
                    <p className="text-sm text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="p-8 min-h-screen flex items-center justify-center">
                <p className="text-gray-600">No data available</p>
            </div>
        );
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount || 0);
    };

    const metrics = [
        {
            title: "Total Users",
            value: stats.totalUsers || 0,
            icon: Users,
            color: "from-blue-500 to-blue-600",
            lightBg: "bg-blue-50",
            trend: `${stats.totalUsers || 0} registered users`
        },
        {
            title: "Total Bookings",
            value: stats.totalBookings || 0,
            icon: Calendar,
            color: "from-purple-500 to-purple-600",
            lightBg: "bg-purple-50",
            trend: `${stats.confirmedBookings || 0} confirmed`
        },
        {
            title: "Available Vehicles",
            value: stats.availableVehicles || 0,
            icon: Car,
            color: "from-emerald-500 to-emerald-600",
            lightBg: "bg-emerald-50",
            trend: `${stats.totalVehicles || 0} total vehicles`
        },
        {
            title: "Total Transactions",
            value: formatCurrency(stats.totalRevenue || 0),
            icon: DollarSign,
            color: "from-orange-500 to-orange-600",
            lightBg: "bg-orange-50",
            trend: formatCurrency(stats.monthlyRevenue || 0) + " this month"
        },
    ];

    const bookingStatusMetrics = [
        {
            title: "Confirmed",
            value: stats.confirmedBookings || 0,
            icon: CheckCircle,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            title: "Active",
            value: stats.activeBookings || 0,
            icon: Clock,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            title: "Pending",
            value: stats.pendingBookings || 0,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50"
        },
        {
            title: "Completed",
            value: stats.completedBookings || 0,
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-50"
        },
        {
            title: "Cancelled",
            value: stats.cancelledBookings || 0,
            icon: XCircle,
            color: "text-red-600",
            bg: "bg-red-50"
        },
    ];

    const paymentMetrics = [
        {
            title: "Paid",
            value: stats.paidBookings || 0,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            title: "Pending Payments",
            value: stats.pendingPayments || 0,
            color: "text-amber-600",
            bg: "bg-amber-50"
        },
        {
            title: "Refunded",
            value: stats.refundedPayments || 0,
            color: "text-gray-600",
            bg: "bg-gray-50"
        },
    ];

    return (
        <div className="p-8 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-sm text-gray-600 mt-1">Overview of system statistics and activity</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.map((metric) => {
                        const Icon = metric.icon;
                        return (
                            <div
                                key={metric.title}
                                className="relative overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5`}></div>

                                <div className="relative p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`${metric.lightBg} p-3 rounded-lg`}>
                                            <Icon className={`w-6 h-6 text-${metric.color.split('-')[1]}-600`} />
                                        </div>
                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    </div>

                                    <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
                                    <p className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</p>
                                    <p className="text-xs text-emerald-600 font-medium">{metric.trend}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Bookings</h2>
                        <div className="space-y-4">
                            {stats.recentBookings && stats.recentBookings.length > 0 ? (
                                stats.recentBookings.slice(0, 5).map((booking, index) => (
                                    <div key={booking._id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {booking.userId?.name || "Unknown User"}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {booking.vehicleId?.name || "Unknown Vehicle"} • {formatCurrency(booking.totalAmount || 0)}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(booking.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            booking.bookingStatus === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                                            booking.bookingStatus === "pending" ? "bg-amber-100 text-amber-700" :
                                            booking.bookingStatus === "cancelled" ? "bg-red-100 text-red-700" :
                                            "bg-gray-100 text-gray-700"
                                        }`}>
                                            {booking.bookingStatus || "unknown"}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No recent bookings</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h2>
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-700">Booking Status</h3>
                                {bookingStatusMetrics.map((metric) => {
                                    const Icon = metric.icon;
                                    return (
                                        <div key={metric.title} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Icon className={`w-4 h-4 ${metric.color}`} />
                                                <span className="text-sm text-gray-600">{metric.title}</span>
                                            </div>
                                            <span className="font-bold text-gray-900">{metric.value}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="space-y-3 mt-4 pt-4 border-t">
                                <h3 className="text-sm font-semibold text-gray-700">Payment Status</h3>
                                {paymentMetrics.map((metric) => (
                                    <div key={metric.title} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">{metric.title}</span>
                                        <span className="font-bold text-gray-900">{metric.value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Today's Transactions</span>
                                    <span className="font-bold text-blue-900">{formatCurrency(stats.todayRevenue || 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {stats.topVendors && stats.topVendors.length > 0 && (
                    <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Top Vendors by Revenue</h2>
                        <div className="space-y-3">
                            {stats.topVendors.map((vendor, index) => (
                                <div key={vendor.vendorId || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{vendor.vendorName || "Unknown Vendor"}</p>
                                        <p className="text-sm text-gray-600">{vendor.bookings} bookings</p>
                                    </div>
                                    <p className="font-bold text-gray-900">{formatCurrency(vendor.revenue || 0)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    return <Dashboard />;
};

export default AdminDashboard;