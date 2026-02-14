import React, { useEffect, useMemo, useState } from "react";
import {
    Search,
    Calendar,
    User,
    Mail,
    Phone,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    RefreshCw,
    Car,
    Wrench,
} from "lucide-react";
import { fetchAllReservations } from "@/data/api";
import Loading from "@/components/Loading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

const statusConfig = {
    confirmed: { label: "Confirmed", className: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
    active: { label: "Active", className: "bg-blue-100 text-blue-700", icon: Clock },
    pending: { label: "Pending", className: "bg-amber-100 text-amber-700", icon: AlertCircle },
    completed: { label: "Completed", className: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700", icon: XCircle },
};

const ManageReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [bookingType, setBookingType] = useState("all"); // "all", "vehicle", "sparePart"

    const loadReservations = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchAllReservations({
                status: filterStatus,
                bookingType: bookingType,
                limit: 100,
                sortBy: "createdAt",
                sortOrder: "desc",
            });
            setReservations(data?.payments || []);
        } catch (err) {
            console.error("Failed to load reservations", err);
            setError(err.response?.data?.message || "Unable to load reservations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReservations();
    }, [filterStatus, bookingType]);

    const filteredReservations = useMemo(() => {
        return reservations.filter((res) => {
            const search = searchTerm.toLowerCase();
            const matchesSearch =
                res.customer?.name?.toLowerCase().includes(search) ||
                res.customer?.email?.toLowerCase().includes(search) ||
                res.vehicle?.name?.toLowerCase().includes(search) ||
                res.sparePart?.name?.toLowerCase().includes(search);
            return matchesSearch;
        });
    }, [reservations, searchTerm]);

    const stats = useMemo(() => {
        const totals = reservations.reduce(
            (acc, res) => {
                const status = res.bookingStatus?.toLowerCase();
                if (status === "confirmed") acc.confirmed += 1;
                if (status === "pending") acc.pending += 1;
                if (status === "cancelled") acc.cancelled += 1;
                if (res.paymentStatus === "paid") {
                    acc.revenue += res.amount || 0;
                }
                return acc;
            },
            { total: reservations.length, confirmed: 0, pending: 0, cancelled: 0, revenue: 0 }
        );
        totals.total = reservations.length;
        return totals;
    }, [reservations]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);

    const getItemName = (reservation) => {
        if (reservation.bookingType === "vehicle" && reservation.vehicle) {
            return reservation.vehicle.name;
        } else if (reservation.bookingType === "sparePart" && reservation.sparePart) {
            return reservation.sparePart.name;
        }
        return "Unknown Item";
    };

    const getItemCategory = (reservation) => {
        if (reservation.bookingType === "vehicle" && reservation.vehicle) {
            return reservation.vehicle.category;
        } else if (reservation.bookingType === "sparePart" && reservation.sparePart) {
            return reservation.sparePart.category;
        }
        return "N/A";
    };

    const getItemIcon = (reservation) => {
        return reservation.bookingType === "vehicle" ? Car : Wrench;
    };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header with toggle */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Reservations Management</h1>
                            <p className="text-sm text-gray-600 mt-1">Manage all vehicle and spare part reservations</p>
                        </div>
                        
                        {/* Booking Type Toggle */}
                        <div className="flex items-center gap-2 bg-white rounded-lg p-1 border">
                            <button
                                onClick={() => setBookingType("all")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    bookingType === "all" 
                                        ? "bg-blue-100 text-blue-700" 
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                <Calendar size={16} />
                                All Reservations
                            </button>
                            <button
                                onClick={() => setBookingType("vehicle")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    bookingType === "vehicle" 
                                        ? "bg-emerald-100 text-emerald-700" 
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                <Car size={16} />
                                Vehicles
                            </button>
                            <button
                                onClick={() => setBookingType("sparePart")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    bookingType === "sparePart" 
                                        ? "bg-orange-100 text-orange-700" 
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                <Wrench size={16} />
                                Spare Parts
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <Card className="shadow-none border-slate-200">
                        <CardHeader>
                            <CardDescription>Total Reservations</CardDescription>
                            <CardTitle className="text-2xl">{stats.total}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="shadow-none border-slate-200">
                        <CardHeader>
                            <CardDescription>Confirmed</CardDescription>
                            <CardTitle className="text-2xl text-emerald-600">{stats.confirmed}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="shadow-none border-slate-200">
                        <CardHeader>
                            <CardDescription>Pending</CardDescription>
                            <CardTitle className="text-2xl text-amber-600">{stats.pending}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="shadow-none border-slate-200">
                        <CardHeader>
                            <CardDescription>Cancelled</CardDescription>
                            <CardTitle className="text-2xl text-red-600">{stats.cancelled}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="shadow-none border-slate-200">
                        <CardHeader>
                            <CardDescription>Revenue (paid)</CardDescription>
                            <CardTitle className="text-2xl text-blue-600">{formatCurrency(stats.revenue)}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            type="text"
                            placeholder="Search by customer, vehicle, or spare part..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                        >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <Button variant="outline" size="sm" onClick={loadReservations}>
                            <RefreshCw size={16} /> Refresh
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="py-12">
                            <Loading />
                        </div>
                    ) : error ? (
                        <div className="p-6 text-red-600">{error}</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Customer</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Contact</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Item</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Dates</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Payment</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredReservations.map((reservation) => {
                                        const normalizedStatus = reservation.bookingStatus?.toLowerCase();
                                        const config = statusConfig[normalizedStatus] || statusConfig.pending;
                                        const StatusIcon = config.icon;
                                        const ItemIcon = getItemIcon(reservation);

                                        return (
                                            <tr key={reservation.id || reservation.bookingId} className="hover:bg-blue-50 transition duration-150">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <User size={18} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-900">{reservation.customer?.name || "Unknown"}</p>
                                                            <p className="text-xs text-slate-500">ID: {reservation.customer?.id || reservation.customer?._id || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <Mail size={14} className="text-slate-400" />
                                                            {reservation.customer?.email || "N/A"}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <Phone size={14} className="text-slate-400" />
                                                            {reservation.customer?.contact || "N/A"}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                            reservation.bookingType === "vehicle" 
                                                                ? "bg-emerald-100" 
                                                                : "bg-orange-100"
                                                        }`}>
                                                            <ItemIcon size={16} className={
                                                                reservation.bookingType === "vehicle" 
                                                                    ? "text-emerald-600" 
                                                                    : "text-orange-600"
                                                            } />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium text-slate-900">{getItemName(reservation)}</p>
                                                            <p className="text-sm text-slate-600">{getItemCategory(reservation)}</p>
                                                            <Badge variant="outline" className="text-xs">
                                                                {reservation.bookingType === "vehicle" ? "Vehicle" : "Spare Part"}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium text-slate-900">{formatDate(reservation.startDate)}</p>
                                                        <p className="text-sm text-slate-600">to {formatDate(reservation.endDate)}</p>
                                                        <p className="text-xs text-slate-500">{reservation.totalDays} day{reservation.totalDays !== 1 ? "s" : ""}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="inline-flex items-center gap-2">
                                                        {StatusIcon && <StatusIcon size={16} className={config.className.split(" ")[1]} />}
                                                        <Badge className={config.className}>{config.label}</Badge>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <p className="font-semibold text-slate-900">{formatCurrency(reservation.amount)}</p>
                                                        <p className="text-xs text-slate-500">Payment: {reservation.paymentStatus}</p>
                                                        {reservation.insuranceSelected && (
                                                            <p className="text-xs text-slate-500">Insurance: Rs. {reservation.insuranceAmount || 500}</p>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {filteredReservations.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Calendar size={32} className="text-slate-400" />
                                                    <span className="text-slate-500 text-sm">No reservations found</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageReservations;