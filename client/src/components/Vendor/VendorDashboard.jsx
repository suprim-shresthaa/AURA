import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Car, 
    DollarSign, 
    Calendar, 
    Users, 
    TrendingUp, 
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowRight,
    Package,
    Star
} from 'lucide-react';
import Sidebar from './Sidebar';
import { AppContent } from '../context/AppContext';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'react-toastify';

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, trend, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
            {trend !== undefined && (
                <span className={`text-sm font-medium flex items-center gap-1 ${
                    trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                    <TrendingUp size={14} className={trend < 0 ? 'rotate-180' : ''} />
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
    </div>
);

// Main Dashboard Component
export default function VendorDashboard() {
    const navigate = useNavigate();
    const { userData } = useContext(AppContent);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/vendors/dashboard/stats');
                if (response.data.success) {
                    setStats(response.data.data);
                } else {
                    setError('Failed to load dashboard data');
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err.response?.data?.message || 'Failed to load dashboard data');
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

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

    const formatCurrency = (amount) => {
        return `Rs. ${amount?.toLocaleString('en-NP') || '0'}`;
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

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-gray-600">{error || 'Failed to load dashboard data'}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-sm text-gray-600">Welcome back, {userData?.name || 'Vendor'}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/vendor/vehicle-upload')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Car size={18} />
                        Add Vehicle
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto p-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatsCard
                            title="Total Vehicles"
                            value={stats.totalVehicles || 0}
                            subtitle={`${stats.availableVehicles || 0} available`}
                            icon={Car}
                            color="bg-blue-600"
                        />
                        <StatsCard
                            title="Active Bookings"
                            value={stats.activeBookings || 0}
                            subtitle={`${stats.pendingBookings || 0} pending`}
                            icon={Calendar}
                            color="bg-green-600"
                        />
                        <StatsCard
                            title="Monthly Earnings"
                            value={formatCurrency(stats.monthlyEarnings || 0)}
                            subtitle={`Total: ${formatCurrency(stats.totalEarnings || 0)}`}
                            icon={DollarSign}
                            color="bg-purple-600"
                        />
                        <StatsCard
                            title="Total Customers"
                            value={stats.uniqueCustomers || 0}
                            subtitle={`${stats.completedBookings || 0} completed bookings`}
                            icon={Users}
                            color="bg-orange-600"
                        />
                    </div>

                    {/* Recent Bookings and Top Vehicles */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Recent Bookings */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">Recent Bookings</h3>
                                <button
                                    onClick={() => navigate('/vendor/reservations')}
                                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    View All
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                            <div className="p-6">
                                {stats.recentBookings && stats.recentBookings.length > 0 ? (
                                    <div className="space-y-4">
                                        {stats.recentBookings.slice(0, 5).map((booking) => (
                                            <div
                                                key={booking._id}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                                onClick={() => navigate(`/vendor/reservations`)}
                                            >
                                                <div className="flex items-center gap-4 flex-1">
                                                    {booking.vehicleId?.mainImage && (
                                                        <img
                                                            src={booking.vehicleId.mainImage}
                                                            alt={booking.vehicleId.name}
                                                            className="w-12 h-12 rounded-lg object-cover"
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-gray-900 truncate">
                                                            {booking.vehicleId?.name || 'Unknown Vehicle'}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {booking.userId?.name || 'Unknown Customer'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">
                                                        {formatCurrency(booking.totalAmount)}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {getStatusIcon(booking.bookingStatus)}
                                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                                                            {booking.bookingStatus}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-600">No bookings yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Top Performing Vehicles */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">Top Performing Vehicles</h3>
                                <button
                                    onClick={() => navigate('/vendor/listings')}
                                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    View All
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                            <div className="p-6">
                                {stats.topVehicles && stats.topVehicles.length > 0 ? (
                                    <div className="space-y-4">
                                        {stats.topVehicles.map((vehicle, index) => (
                                            <div
                                                key={vehicle.vehicleId}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                                onClick={() => navigate('/vendor/listings')}
                                            >
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                                                        {index + 1}
                                                    </div>
                                                    {vehicle.mainImage && (
                                                        <img
                                                            src={vehicle.mainImage}
                                                            alt={vehicle.name}
                                                            className="w-12 h-12 rounded-lg object-cover"
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-gray-900 truncate">
                                                            {vehicle.name}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {vehicle.category} • {vehicle.bookings} bookings
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">
                                                        {formatCurrency(vehicle.earnings)}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {vehicle.isAvailable ? (
                                                            <span className="text-xs text-green-600 font-medium">Available</span>
                                                        ) : (
                                                            <span className="text-xs text-gray-500 font-medium">Rented</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-600">No vehicles yet</p>
                                        <button
                                            onClick={() => navigate('/vendor/vehicle-upload')}
                                            className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            Add your first vehicle
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">Completed Bookings</h4>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stats.completedBookings || 0}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Package className="w-5 h-5 text-blue-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">Available Vehicles</h4>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stats.availableVehicles || 0}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-purple-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">Total Revenue</h4>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalEarnings || 0)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
