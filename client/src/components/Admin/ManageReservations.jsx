import React, { useState } from "react";
import { Search, Trash2, Edit2, Calendar, User, Mail, Phone, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";

const ManageReservations = () => {
    const [reservations, setReservations] = useState([
        {
            id: 1,
            guestName: "John Doe",
            email: "john@example.com",
            phone: "+1 (555) 123-4567",
            checkInDate: "2025-11-15",
            checkOutDate: "2025-11-18",
            roomType: "Deluxe Suite",
            guests: 2,
            status: "Confirmed",
            totalPrice: 450,
        },
        {
            id: 2,
            guestName: "Jane Smith",
            email: "jane@example.com",
            phone: "+1 (555) 234-5678",
            checkInDate: "2025-11-20",
            checkOutDate: "2025-11-23",
            roomType: "Standard Room",
            guests: 1,
            status: "Pending",
            totalPrice: 300,
        },
        {
            id: 3,
            guestName: "Michael Johnson",
            email: "mike@example.com",
            phone: "+1 (555) 345-6789",
            checkInDate: "2025-11-10",
            checkOutDate: "2025-11-12",
            roomType: "Ocean View",
            guests: 3,
            status: "Confirmed",
            totalPrice: 600,
        },
        {
            id: 4,
            guestName: "Sarah Lee",
            email: "sarah@example.com",
            phone: "+1 (555) 456-7890",
            checkInDate: "2025-11-25",
            checkOutDate: "2025-11-27",
            roomType: "Deluxe Suite",
            guests: 2,
            status: "Cancelled",
            totalPrice: 450,
        },
        {
            id: 5,
            guestName: "Emily Brown",
            email: "emily@example.com",
            phone: "+1 (555) 567-8901",
            checkInDate: "2025-12-01",
            checkOutDate: "2025-12-05",
            roomType: "Presidential Suite",
            guests: 4,
            status: "Confirmed",
            totalPrice: 1200,
        },
    ]);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [editingId, setEditingId] = useState(null);

    const filteredReservations = reservations.filter((res) => {
        const matchesSearch =
            res.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            res.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "All" || res.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this reservation?")) {
            setReservations(reservations.filter((res) => res.id !== id));
        }
    };

    const handleStatusChange = (id, newStatus) => {
        setReservations(
            reservations.map((res) =>
                res.id === id ? { ...res, status: newStatus } : res
            )
        );
        setEditingId(null);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Confirmed":
                return <CheckCircle size={16} className="text-emerald-600" />;
            case "Pending":
                return <AlertCircle size={16} className="text-amber-600" />;
            case "Cancelled":
                return <XCircle size={16} className="text-red-600" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Confirmed":
                return "bg-emerald-100 text-emerald-700";
            case "Pending":
                return "bg-amber-100 text-amber-700";
            case "Cancelled":
                return "bg-red-100 text-red-700";
            default:
                return "bg-slate-100 text-slate-700";
        }
    };

    const stats = {
        total: reservations.length,
        confirmed: reservations.filter((r) => r.status === "Confirmed").length,
        pending: reservations.filter((r) => r.status === "Pending").length,
        cancelled: reservations.filter((r) => r.status === "Cancelled").length,
        totalRevenue: reservations
            .filter((r) => r.status === "Confirmed")
            .reduce((sum, r) => sum + r.totalPrice, 0),
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Calendar size={24} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Reservations</h1>
                    </div>
                    <p className="text-slate-600 ml-11">View and manage all guest reservations</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <p className="text-slate-600 text-sm font-medium mb-1">Total</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <p className="text-slate-600 text-sm font-medium mb-1">Confirmed</p>
                        <p className="text-2xl font-bold text-emerald-600">{stats.confirmed}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <p className="text-slate-600 text-sm font-medium mb-1">Pending</p>
                        <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <p className="text-slate-600 text-sm font-medium mb-1">Cancelled</p>
                        <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <p className="text-slate-600 text-sm font-medium mb-1">Revenue</p>
                        <p className="text-2xl font-bold text-blue-600">${stats.totalRevenue}</p>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by guest name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-slate-900"
                    >
                        <option>All</option>
                        <option>Confirmed</option>
                        <option>Pending</option>
                        <option>Cancelled</option>
                    </select>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Guest Info</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Contact</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Dates</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Room & Guests</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Price</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredReservations.map((reservation) => (
                                    <tr
                                        key={reservation.id}
                                        className="hover:bg-blue-50 transition duration-150 group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <User size={18} className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{reservation.guestName}</p>
                                                    <p className="text-xs text-slate-500">ID: {reservation.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Mail size={14} className="text-slate-400" />
                                                    {reservation.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Phone size={14} className="text-slate-400" />
                                                    {reservation.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-slate-900">{reservation.checkInDate}</p>
                                                <p className="text-sm text-slate-600">to {reservation.checkOutDate}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-slate-900">{reservation.roomType}</p>
                                                <p className="text-sm text-slate-600">{reservation.guests} {reservation.guests === 1 ? "guest" : "guests"}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingId === reservation.id ? (
                                                <select
                                                    value={reservation.status}
                                                    onChange={(e) => handleStatusChange(reservation.id, e.target.value)}
                                                    className="px-3 py-1 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option>Confirmed</option>
                                                    <option>Pending</option>
                                                    <option>Cancelled</option>
                                                </select>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(reservation.status)}
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(reservation.status)}`}>
                                                        {reservation.status}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-900">${reservation.totalPrice}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    onClick={() => setEditingId(editingId === reservation.id ? null : reservation.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition duration-150 opacity-0 group-hover:opacity-100"
                                                    title="Edit status"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(reservation.id)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition duration-150 opacity-0 group-hover:opacity-100"
                                                    title="Delete reservation"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredReservations.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
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

                    {/* Footer */}
                    {filteredReservations.length > 0 && (
                        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between items-center">
                            <span className="text-sm text-slate-600">
                                Showing <span className="font-semibold text-slate-900">{filteredReservations.length}</span> of <span className="font-semibold text-slate-900">{reservations.length}</span> reservations
                            </span>
                            <span className="text-sm text-slate-600">
                                <Clock size={14} className="inline mr-1" />
                                Last updated: Today
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageReservations;