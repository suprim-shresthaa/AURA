import React, { useState, useEffect } from 'react';
import { 
    Calendar, 
    Search, 
    Filter,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Car,
    DollarSign
} from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'react-toastify';

export default function Bookings() {
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/bookings/my-bookings');
                if (response.data.success) {
                    setBookings(response.data.data);
                    setFilteredBookings(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching bookings:', error);
                toast.error('Failed to load bookings');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    useEffect(() => {
        const filtered = bookings.filter(booking => {
            const matchesSearch = 
                booking.vehicleId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.vehicleId?.category?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || booking.bookingStatus === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
        setFilteredBookings(filtered);
    }, [searchTerm, statusFilter, bookings]);

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

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid':
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">My Bookings</h3>
                    <p className="mt-1 text-sm text-gray-500">View and manage your vehicle bookings</p>
                </div>
            </div>

            <div className="p-6">
                {/* Filters */}
                <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by vehicle name or category..."
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

                {/* Bookings List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading bookings...</p>
                        </div>
                    </div>
                ) : filteredBookings.length > 0 ? (
                    <div className="space-y-4">
                        {filteredBookings.map((booking) => (
                            <div
                                key={booking._id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    {/* Vehicle Image and Info */}
                                    <div className="flex items-center gap-4 flex-1">
                                        {booking.vehicleId?.mainImage && (
                                            <img
                                                src={booking.vehicleId.mainImage}
                                                alt={booking.vehicleId.name}
                                                className="w-20 h-20 rounded-lg object-cover"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Car className="w-4 h-4 text-gray-400" />
                                                <h4 className="font-semibold text-gray-900">
                                                    {booking.vehicleId?.name || 'Unknown Vehicle'}
                                                </h4>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {booking.vehicleId?.category || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
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

                                    {/* Amount */}
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {formatCurrency(booking.totalAmount)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {booking.paymentMethod === 'esewa' ? 'eSewa' : booking.paymentMethod || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(booking.bookingStatus)}
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}>
                                                {booking.bookingStatus}
                                            </span>
                                        </div>
                                        <div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                                Payment: {booking.paymentStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {booking.notes && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Notes:</span> {booking.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
                        <p className="text-gray-600">
                            {searchTerm || statusFilter !== 'all' 
                                ? 'Try adjusting your filters' 
                                : 'You don\'t have any bookings yet'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

