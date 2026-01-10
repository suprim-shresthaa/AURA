import React, { useEffect, useMemo, useState } from "react";
import {
    Search,
    Package,
    User,
    Mail,
    Phone,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    RefreshCw,
    Truck,
    MapPin,
    DollarSign,
} from "lucide-react";
import { fetchAllOrders, updateOrderStatus } from "@/data/api";
import Loading from "@/components/ui/Loading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

const statusConfig = {
    confirmed: { label: "Confirmed", className: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
    processing: { label: "Processing", className: "bg-blue-100 text-blue-700", icon: Clock },
    shipped: { label: "Shipped", className: "bg-blue-100 text-blue-700", icon: Truck },
    delivered: { label: "Delivered", className: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
    pending: { label: "Pending", className: "bg-amber-100 text-amber-700", icon: AlertCircle },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700", icon: XCircle },
};

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterPaymentStatus, setFilterPaymentStatus] = useState("all");
    const [updatingStatus, setUpdatingStatus] = useState({});

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchAllOrders({
                status: filterStatus,
                paymentStatus: filterPaymentStatus !== "all" ? filterPaymentStatus : undefined,
                limit: 100,
                sortBy: "createdAt",
                sortOrder: "desc",
            });
            setOrders(data?.orders || []);
        } catch (err) {
            console.error("Failed to load orders", err);
            setError(err.response?.data?.message || "Unable to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [filterStatus, filterPaymentStatus]);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const search = searchTerm.toLowerCase();
            const matchesSearch =
                order.customer?.name?.toLowerCase().includes(search) ||
                order.customer?.email?.toLowerCase().includes(search) ||
                order.items?.some(item => 
                    item.partName?.toLowerCase().includes(search) ||
                    item.category?.toLowerCase().includes(search)
                ) ||
                order.orderId?.toLowerCase().includes(search);
            return matchesSearch;
        });
    }, [orders, searchTerm]);

    const stats = useMemo(() => {
        const totals = orders.reduce(
            (acc, order) => {
                const status = order.orderStatus?.toLowerCase();
                if (status === "confirmed") acc.confirmed += 1;
                if (status === "pending") acc.pending += 1;
                if (status === "processing") acc.processing += 1;
                if (status === "shipped") acc.shipped += 1;
                if (status === "delivered") acc.delivered += 1;
                if (status === "cancelled") acc.cancelled += 1;
                if (order.paymentStatus === "completed") {
                    acc.revenue += order.totalAmount || 0;
                }
                return acc;
            },
            { total: orders.length, confirmed: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0, revenue: 0 }
        );
        totals.total = orders.length;
        return totals;
    }, [orders]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const formatCurrency = (amount) => {
        return `Rs. ${amount?.toLocaleString('en-NP') || '0'}`;
    };

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
        try {
            const response = await updateOrderStatus(orderId, newStatus);
            if (response.success) {
                // Update the order in the local state
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order.id === orderId || order.orderId === orderId
                            ? { ...order, ...response.data }
                            : order
                    )
                );
                toast.success(`Order status updated to ${newStatus}`);
            } else {
                toast.error(response.message || "Failed to update order status");
            }
        } catch (err) {
            console.error("Error updating order status:", err);
            toast.error(err.response?.data?.message || "Failed to update order status");
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto">

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <Card className="shadow-none border-slate-200">
                        <CardHeader>
                            <CardDescription>Total Orders</CardDescription>
                            <CardTitle className="text-2xl">{stats.total}</CardTitle>
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
                            <CardDescription>Processing</CardDescription>
                            <CardTitle className="text-2xl text-blue-600">{stats.processing}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="shadow-none border-slate-200">
                        <CardHeader>
                            <CardDescription>Delivered</CardDescription>
                            <CardTitle className="text-2xl text-emerald-600">{stats.delivered}</CardTitle>
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
                            placeholder="Search by customer, part name, or order ID..."
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
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <select
                            value={filterPaymentStatus}
                            onChange={(e) => setFilterPaymentStatus(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                        >
                            <option value="all">All Payment</option>
                            <option value="pending">Pending</option>
                            <option value="initiated">Initiated</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                        </select>
                        <Button variant="outline" size="sm" onClick={loadOrders}>
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
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Order ID</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Customer</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Items</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Amount</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Payment</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredOrders.map((order) => {
                                        const normalizedStatus = order.orderStatus?.toLowerCase();
                                        const config = statusConfig[normalizedStatus] || statusConfig.pending;
                                        const StatusIcon = config.icon;

                                        const getPaymentStatusColor = (status) => {
                                            switch (status) {
                                                case 'completed':
                                                    return 'bg-green-100 text-green-700';
                                                case 'pending':
                                                case 'initiated':
                                                    return 'bg-yellow-100 text-yellow-700';
                                                case 'failed':
                                                    return 'bg-red-100 text-red-700';
                                                case 'refunded':
                                                    return 'bg-gray-100 text-gray-700';
                                                default:
                                                    return 'bg-gray-100 text-gray-700';
                                            }
                                        };

                                        return (
                                            <tr key={order.id || order.orderId} className="hover:bg-blue-50 transition duration-150">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-mono text-slate-600">
                                                        #{order.orderId?.slice(-8).toUpperCase() || order.id?.slice(-8).toUpperCase()}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <User size={18} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-900">{order.customer?.name || "Unknown"}</p>
                                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                                <Mail size={12} className="text-slate-400" />
                                                                {order.customer?.email || "N/A"}
                                                            </p>
                                                            {order.customer?.contact && (
                                                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                                    <Phone size={12} className="text-slate-400" />
                                                                    {order.customer.contact}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1 max-w-xs">
                                                        {order.items?.slice(0, 2).map((item, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                                {item.image && (
                                                                    <img 
                                                                        src={item.image} 
                                                                        alt={item.partName}
                                                                        className="w-8 h-8 rounded object-cover"
                                                                    />
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium text-slate-900 truncate">
                                                                        {item.partName || "Unknown"}
                                                                    </p>
                                                                    <p className="text-xs text-slate-500">
                                                                        Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {order.items?.length > 2 && (
                                                            <p className="text-xs text-slate-500">
                                                                +{order.items.length - 2} more item(s)
                                                            </p>
                                                        )}
                                                        {(!order.items || order.items.length === 0) && (
                                                            <p className="text-sm text-slate-500">No items</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign size={16} className="text-slate-400" />
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{formatCurrency(order.totalAmount)}</p>
                                                            <p className="text-xs text-slate-500">
                                                                {order.paymentMethod === 'esewa' ? 'eSewa' : order.paymentMethod || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-2">
                                                        <div className="inline-flex items-center gap-2">
                                                            {StatusIcon && <StatusIcon size={16} className={config.className.split(" ")[1]} />}
                                                            <Badge className={config.className}>{config.label}</Badge>
                                                        </div>
                                                        <select
                                                            value={order.orderStatus}
                                                            onChange={(e) => handleStatusChange(order.id || order.orderId, e.target.value)}
                                                            disabled={updatingStatus[order.id || order.orderId]}
                                                            className={`px-2 py-1 text-xs border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                                                updatingStatus[order.id || order.orderId] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                                            }`}
                                                        >
                                                            {validStatuses.map((status) => (
                                                                <option key={status} value={status}>
                                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {updatingStatus[order.id || order.orderId] && (
                                                            <p className="text-xs text-blue-600">Updating...</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                                                            {order.paymentStatus}
                                                        </Badge>
                                                        {order.esewaRefId && (
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                ID: {order.esewaRefId.slice(-8)}
                                                            </p>
                                                        )}
                                                        {order.paidAt && (
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                Paid: {formatDate(order.paidAt)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium text-slate-900">{formatDate(order.createdAt)}</p>
                                                        {order.deliveryAddress && (
                                                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                                                                <MapPin size={12} />
                                                                <span className="truncate max-w-[150px]">
                                                                    {order.deliveryAddress.city || order.deliveryAddress.street || "N/A"}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {order.shippedAt && (
                                                            <p className="text-xs text-blue-600 mt-1">
                                                                Shipped: {formatDate(order.shippedAt)}
                                                            </p>
                                                        )}
                                                        {order.deliveredAt && (
                                                            <p className="text-xs text-green-600 mt-1">
                                                                Delivered: {formatDate(order.deliveredAt)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {filteredOrders.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Package size={32} className="text-slate-400" />
                                                    <span className="text-slate-500 text-sm">No orders found</span>
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

export default ManageOrders;

