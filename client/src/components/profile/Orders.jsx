import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Filter,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Package,
    DollarSign,
    Truck,
    MapPin,
    Calendar
} from 'lucide-react';
import { getUserOrders } from '@/data/api';
import { toast } from 'react-toastify';

export default function Orders() {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const ordersData = await getUserOrders();
                setOrders(ordersData);
                setFilteredOrders(ordersData);
            } catch (error) {
                console.error('Error fetching orders:', error);
                toast.error('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    useEffect(() => {
        const filtered = orders.filter(order => {
            const matchesSearch = 
                order.items?.some(item => 
                    item.partName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.sparePartId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                ) || false;
            
            const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
            const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
            
            return matchesSearch && matchesStatus && matchesPayment;
        });
        setFilteredOrders(filtered);
    }, [searchTerm, statusFilter, paymentFilter, orders]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'processing':
            case 'shipped':
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
            case 'delivered':
                return <CheckCircle size={16} className="text-green-600" />;
            case 'processing':
            case 'shipped':
                return <Truck size={16} className="text-blue-600" />;
            case 'pending':
                return <Clock size={16} className="text-yellow-600" />;
            case 'cancelled':
                return <XCircle size={16} className="text-red-600" />;
            default:
                return <AlertCircle size={16} className="text-gray-600" />;
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'completed':
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'initiated':
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'refunded':
                return 'bg-gray-100 text-gray-800';
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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return `Rs. ${amount?.toLocaleString('en-NP') || '0'}`;
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">My Orders</h3>
                    <p className="mt-1 text-sm text-gray-500">View and track your spare parts orders</p>
                </div>
            </div>

            <div className="p-6">
                {/* Filters */}
                <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by part name..."
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
                                <option value="all">All Order Status</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                            >
                                <option value="all">All Payment Status</option>
                                <option value="pending">Pending</option>
                                <option value="initiated">Initiated</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading orders...</p>
                        </div>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <div
                                key={order._id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                {/* Order Header */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-2">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(order.orderStatus)}
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                                {order.orderStatus}
                                            </span>
                                        </div>
                                        <div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                Payment: {order.paymentStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-3 mb-4">
                                    {order.items?.map((item, index) => (
                                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                            {item.sparePartId?.images?.[0] && (
                                                <img
                                                    src={item.sparePartId.images[0]}
                                                    alt={item.partName || item.sparePartId?.name}
                                                    className="w-16 h-16 rounded-lg object-cover"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <h5 className="font-medium text-gray-900">
                                                    {item.partName || item.sparePartId?.name || 'Unknown Part'}
                                                </h5>
                                                <p className="text-sm text-gray-500">
                                                    Quantity: {item.quantity} × {formatCurrency(item.unitPrice)}
                                                </p>
                                                {item.sparePartId?.category && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Category: {item.sparePartId.category}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">
                                                    {formatCurrency(item.totalPrice)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <DollarSign className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                                        </div>
                                        <p className="text-lg font-bold text-blue-600 ml-6">
                                            {formatCurrency(order.totalAmount)}
                                        </p>
                                        <p className="text-xs text-gray-500 ml-6 mt-1">
                                            Payment Method: {order.paymentMethod === 'esewa' ? 'eSewa' : order.paymentMethod || 'N/A'}
                                        </p>
                                        {order.esewaRefId && (
                                            <p className="text-xs text-gray-500 ml-6 mt-1">
                                                Transaction ID: {order.esewaRefId}
                                            </p>
                                        )}
                                        {order.paidAt && (
                                            <p className="text-xs text-gray-500 ml-6 mt-1">
                                                Paid on: {formatDate(order.paidAt)}
                                            </p>
                                        )}
                                    </div>
                                    {order.deliveryAddress && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">Delivery Address:</span>
                                            </div>
                                            <div className="text-sm text-gray-600 ml-6">
                                                {order.deliveryAddress.street && <p>{order.deliveryAddress.street}</p>}
                                                <p>
                                                    {[
                                                        order.deliveryAddress.city,
                                                        order.deliveryAddress.province,
                                                        order.deliveryAddress.postalCode
                                                    ].filter(Boolean).join(', ')}
                                                </p>
                                                {order.deliveryAddress.phone && (
                                                    <p className="mt-1">Phone: {order.deliveryAddress.phone}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Delivery Status */}
                                {order.shippedAt && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Shipped on:</span> {formatDate(order.shippedAt)}
                                        </p>
                                    </div>
                                )}
                                {order.deliveredAt && (
                                    <div className="mt-2">
                                        <p className="text-sm text-green-600 font-medium">
                                            <span className="font-medium">Delivered on:</span> {formatDate(order.deliveredAt)}
                                        </p>
                                    </div>
                                )}

                                {/* Notes */}
                                {order.notes && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Notes:</span> {order.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-600">
                            {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                                ? 'Try adjusting your filters' 
                                : 'You don\'t have any orders yet'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

