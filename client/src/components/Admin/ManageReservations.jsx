import React, { useEffect, useMemo, useState } from "react";
import {
    Calendar,
    Search,
    Filter,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    User,
    Car,
    Wrench,
    DollarSign,
} from "lucide-react";
import { fetchAllReservations } from "@/data/api";

const ManageReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [bookingType, setBookingType] = useState("all");

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

    const filteredReservations = useMemo(
        () =>
            reservations.filter((res) => {
                const search = searchTerm.toLowerCase();
                return (
                    res.customer?.name?.toLowerCase().includes(search) ||
                    res.customer?.email?.toLowerCase().includes(search) ||
                    res.vehicle?.name?.toLowerCase().includes(search) ||
                    res.sparePart?.name?.toLowerCase().includes(search)
                );
            }),
        [reservations, searchTerm]
    );

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "confirmed":
            case "completed":
                return "bg-green-100 text-green-800";
            case "active":
                return "bg-blue-100 text-blue-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case "confirmed":
            case "completed":
                return <CheckCircle size={16} className="text-green-600" />;
            case "active":
                return <Clock size={16} className="text-blue-600" />;
            case "pending":
                return <AlertCircle size={16} className="text-yellow-600" />;
            case "cancelled":
                return <XCircle size={16} className="text-red-600" />;
            default:
                return null;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toLocaleString("en-NP")}`;

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
        if(reservation.bookingType === "vehicle"){
            return <img src={reservation?.vehicle?.image} alt={reservation?.vehicle?.name} className="w-10 h-10 object-cover rounded-lg" />;
        } else if(reservation.bookingType === "sparePart"){
            return <img src={reservation.sparePart?.images[0]} alt={reservation.sparePart?.name} className="w-10 h-10 object-cover rounded-lg" />;
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 p-4">
                <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
                <p className="text-sm text-gray-600">Manage all vehicle and spare part bookings</p>
            </div>

            <div className="p-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by item, customer name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="relative">
                            <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={bookingType}
                                onChange={(e) => setBookingType(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                            >
                                <option value="all">All Types</option>
                                <option value="vehicle">Vehicles</option>
                                <option value="sparePart">Spare Parts</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                            <p className="text-gray-600">Loading reservations...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-lg shadow-sm border border-red-100 p-8 text-center">
                        <p className="text-red-600 font-medium">{error}</p>
                    </div>
                ) : filteredReservations.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Item
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Dates
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredReservations.map((reservation) => {
                                        return (
                                            <tr
                                                key={reservation.id || reservation.bookingId || reservation._id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        {getItemIcon(reservation)}
                                                        <div>
                                                            <p className="font-semibold text-gray-900">
                                                                {getItemName(reservation)}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {getItemCategory(reservation)}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {reservation.bookingType === "vehicle"
                                                                    ? "Vehicle"
                                                                    : "Spare Part"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {reservation.customer?.name || "Unknown Customer"}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {reservation.customer?.email || "N/A"}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {reservation.customer?.contact || "N/A"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <div>
                                                            <p className="text-sm text-gray-900">
                                                                {formatDate(reservation.startDate)}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                to {formatDate(reservation.endDate)}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {reservation.totalDays} day
                                                                {reservation.totalDays !== 1 ? "s" : ""}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                                        <div>
                                                            <p className="font-semibold text-gray-900">
                                                                {formatCurrency(reservation.amount)}
                                                            </p>
                                                            {reservation.insuranceSelected && (
                                                                <p className="text-xs text-gray-500">
                                                                    Insurance: Rs. {reservation.insuranceAmount || 500}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(reservation.bookingStatus)}
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                                reservation.bookingStatus
                                                            )}`}
                                                        >
                                                            {reservation.bookingStatus || "unknown"}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No reservations found</h3>
                        <p className="text-gray-600">
                            {searchTerm || filterStatus !== "all" || bookingType !== "all"
                                ? "Try adjusting your filters"
                                : "No reservations are available right now"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageReservations;