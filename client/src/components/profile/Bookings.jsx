import React, { useState, useEffect, Fragment } from 'react';
import { 
    Calendar, 
    Search, 
    Filter,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Car,
    DollarSign,
    Package
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
            const isVehicle = booking.bookingType === 'vehicle' || booking.vehicleId;
            const isSparePart = booking.bookingType === 'sparePart' || booking.sparePartId;
            
            let matchesSearch = false;
            if (isVehicle) {
                matchesSearch = 
                    booking.vehicleId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.vehicleId?.category?.toLowerCase().includes(searchTerm.toLowerCase());
            } else if (isSparePart) {
                matchesSearch = 
                    booking.sparePartId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.sparePartId?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.sparePartId?.brand?.toLowerCase().includes(searchTerm.toLowerCase());
            }
            
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
                    <p className="mt-1 text-sm text-gray-500">View and manage your vehicle and spare part bookings</p>
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
                                placeholder="Search by name, category, or brand..."
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
                    <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Item
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        Rental period
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        Total
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredBookings.map((booking) => {
                                    const isVehicle = booking.bookingType === 'vehicle' || booking.vehicleId;
                                    const entity = isVehicle ? booking.vehicleId : booking.sparePartId;
                                    const entityImage = isVehicle ? entity?.mainImage : (entity?.images?.[0] || null);

                                    return (
                                        <Fragment key={booking._id}>
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4 align-top">
                                                    <div className="flex items-center gap-3 min-w-[200px] max-w-xs">
                                                        {entityImage && (
                                                            <img
                                                                src={entityImage}
                                                                alt={entity?.name || ''}
                                                                className="w-16 h-16 rounded-lg object-cover shrink-0"
                                                            />
                                                        )}
                                                        <a href={isVehicle ? `/vehicles/${entity?._id}` : `/spare-parts/${entity?._id}`} className="hover:underline">
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                {isVehicle ? (
                                                                    <Car className="w-4 h-4 text-gray-400 shrink-0" />
                                                                ) : (
                                                                    <Package className="w-4 h-4 text-gray-400 shrink-0" />
                                                                )}
                                                                <span className="font-semibold text-gray-900">
                                                                    {entity?.name || (isVehicle ? 'Unknown Vehicle' : 'Unknown Spare Part')}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-500 mt-0.5">
                                                                {isVehicle
                                                                    ? entity?.category || 'N/A'
                                                                    : `${entity?.category || 'N/A'}${entity?.brand ? ` • ${entity.brand}` : ''}`}
                                                            </p>
                                                        </div>
                                                        </a>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 align-top whitespace-nowrap">
                                                    <div className="flex items-start gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="font-medium text-gray-900">
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
                                                <td className="px-4 py-4 align-top whitespace-nowrap">
                                                    <div className="flex items-start gap-2">
                                                        <DollarSign className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="font-semibold text-gray-900">
                                                                {formatCurrency(booking.totalAmount)}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {booking.paymentMethod === 'esewa' ? 'eSewa' : booking.paymentMethod || 'N/A'}
                                                            </p>
                                                            {booking.insuranceSelected && (
                                                                <p className="text-xs text-gray-500 mt-1">Insurance</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            {getStatusIcon(booking.bookingStatus)}
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}>
                                                                {booking.bookingStatus}
                                                            </span>
                                                        </div>
                                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium w-fit ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                                            Payment: {booking.paymentStatus}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            {booking.notes && (
                                                <tr className="bg-gray-50/80">
                                                    <td colSpan={4} className="px-4 py-3 text-sm text-gray-600 border-t border-gray-100">
                                                        <span className="font-medium text-gray-700">Notes:</span>{' '}
                                                        {booking.notes}
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
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

