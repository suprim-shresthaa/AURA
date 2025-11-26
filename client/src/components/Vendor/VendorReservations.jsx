import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
    DollarSign
} from 'lucide-react';
import Sidebar from './Sidebar';
import { AppContent } from '../context/AppContext';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'react-toastify';

export default function VendorReservations() {
    const navigate = useNavigate();
    const { userData } = useContext(AppContent);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const params = statusFilter !== 'all' ? { status: statusFilter } : {};
                const response = await axiosInstance.get('/vendors/dashboard/bookings', { params });
                if (response.data.success) {
                    setBookings(response.data.data);
                    setFilteredBookings(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching bookings:', error);
                toast.error('Failed to load reservations');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [statusFilter]);

    useEffect(() => {
        const filtered = bookings.filter(booking => {
            const matchesSearch = 
                booking.vehicleId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
        setFilteredBookings(filtered);
    }, [searchTerm, bookings]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'active':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed':
            case 'completed':
                return <CheckCircle size={16} className="text-green-600" />;
            case 'active':
                return <Clock size={16} className="text-blue-600" />;
            case 'pending':
                return <AlertCircle size={16} className="text-yellow-600" />;
            case 'cancelled':
                return <XCircle size={16} className="text-red-600" />;
            default:
                return null;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const formatCurrency = (amount) => {
        return `Rs. ${amount?.toLocaleString('en-NP') || '0'}`;
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
                            <p className="text-sm text-gray-600">Manage all vehicle bookings</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto p-6">
                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by vehicle, customer name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
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
                        </div>
                    </div>

                    {/* Bookings Table */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading reservations...</p>
                            </div>
                        </div>
                    ) : filteredBookings.length > 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Vehicle
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
                                        {filteredBookings.map((booking) => (
                                            <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        {booking.vehicleId?.mainImage && (
                                                            <img
                                                                src={booking.vehicleId.mainImage}
                                                                alt={booking.vehicleId.name}
                                                                className="w-12 h-12 rounded-lg object-cover"
                                                            />
                                                        )}
                                                        <div>
                                                            <p className="font-semibold text-gray-900">
                                                                {booking.vehicleId?.name || 'Unknown Vehicle'}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {booking.vehicleId?.category || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {booking.userId?.name || 'Unknown Customer'}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {booking.userId?.email || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <div>
                                                            <p className="text-sm text-gray-900">
                                                                {formatDate(booking.startDate)}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                to {formatDate(booking.endDate)}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {booking.totalDays} day{booking.totalDays !== 1 ? 's' : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                                        <p className="font-semibold text-gray-900">
                                                            {formatCurrency(booking.totalAmount)}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(booking.bookingStatus)}
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}>
                                                            {booking.bookingStatus}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reservations found</h3>
                            <p className="text-gray-600 mb-4">
                                {searchTerm || statusFilter !== 'all' 
                                    ? 'Try adjusting your filters' 
                                    : 'You don\'t have any reservations yet'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

