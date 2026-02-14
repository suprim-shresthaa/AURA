import React, { useEffect, useState } from "react";
import {
    Search,
    Wrench,
    Eye,
    EyeOff,
    RefreshCw,
    Package,
    DollarSign,
    Calendar,
    User,
    MapPin,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";
import { fetchAllSpareParts, toggleSparePartAvailability } from "@/data/api";
import Loading from "@/components/Loading";
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

const ManageSpareParts = () => {
    const [spareParts, setSpareParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterAvailability, setFilterAvailability] = useState("all");
    const [updatingAvailability, setUpdatingAvailability] = useState({});

    const loadSpareParts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchAllSpareParts({
                availability: filterAvailability,
                limit: 100,
                sortBy: "createdAt",
                sortOrder: "desc",
            });
            setSpareParts(data || []);
        } catch (err) {
            console.error("Failed to load spare parts", err);
            setError(err.response?.data?.message || "Unable to load spare parts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSpareParts();
    }, [filterAvailability]);

    const filteredSpareParts = spareParts.filter((part) => {
        const search = searchTerm.toLowerCase();
        return (
            part.name?.toLowerCase().includes(search) ||
            part.category?.toLowerCase().includes(search) ||
            part.description?.toLowerCase().includes(search) ||
            part.brand?.toLowerCase().includes(search)
        );
    });

    const handleToggleAvailability = async (partId, currentAvailability) => {
        setUpdatingAvailability(prev => ({ ...prev, [partId]: true }));
        try {
            await toggleSparePartAvailability(partId, !currentAvailability);
            setSpareParts(prev => 
                prev.map(part => 
                    part._id === partId 
                        ? { ...part, isAvailable: !currentAvailability }
                        : part
                )
            );
            toast.success(`Spare part ${!currentAvailability ? 'enabled' : 'disabled'} successfully`);
        } catch (err) {
            console.error("Failed to toggle availability", err);
            toast.error(err.response?.data?.message || "Failed to update availability");
        } finally {
            setUpdatingAvailability(prev => ({ ...prev, [partId]: false }));
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const stats = {
        total: spareParts.length,
        available: spareParts.filter(p => p.isAvailable).length,
        unavailable: spareParts.filter(p => !p.isAvailable).length,
        totalValue: spareParts.reduce((sum, p) => sum + (p.rentPrice || 0), 0),
    };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Spare Parts Management</h1>
                    <p className="text-sm text-gray-600 mt-1">Manage inventory and availability of spare parts</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="shadow-none border-slate-200">
                        <CardHeader>
                            <CardDescription>Total Parts</CardDescription>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Package className="w-5 h-5 text-blue-600" />
                                {stats.total}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="shadow-none border-slate-200">
                        <CardHeader>
                            <CardDescription>Available</CardDescription>
                            <CardTitle className="text-2xl text-emerald-600 flex items-center gap-2">
                                <Eye className="w-5 h-5" />
                                {stats.available}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="shadow-none border-slate-200">
                        <CardHeader>
                            <CardDescription>Unavailable</CardDescription>
                            <CardTitle className="text-2xl text-red-600 flex items-center gap-2">
                                <EyeOff className="w-5 h-5" />
                                {stats.unavailable}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="shadow-none border-slate-200">
                        <CardHeader>
                            <CardDescription>Total Value</CardDescription>
                            <CardTitle className="text-2xl text-blue-600 flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                {formatCurrency(stats.totalValue)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            type="text"
                            placeholder="Search spare parts by name, category, brand, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={filterAvailability}
                            onChange={(e) => setFilterAvailability(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                        >
                            <option value="all">All Parts</option>
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                        </select>
                        <Button variant="outline" size="sm" onClick={loadSpareParts}>
                            <RefreshCw size={16} /> Refresh
                        </Button>
                    </div>
                </div>

                {/* Spare Parts Table */}
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
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Part Details</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Brand</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Price/Stock</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Created</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredSpareParts.map((part) => (
                                        <tr key={part._id} className="hover:bg-blue-50 transition duration-150">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                                                        <Wrench size={20} className="text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{part.name}</p>
                                                        <p className="text-sm text-slate-600">{part.category}</p>
                                                        <p className="text-xs text-slate-500 max-w-xs truncate">{part.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {part.brand}
                                                    </p>
                                                    <p className="text-sm text-slate-600">
                                                        Compatible: {part.compatibleVehicles || "General"}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-slate-900">{formatCurrency(part.rentPrice)}</p>
                                                    <p className="text-sm text-slate-600">Stock: {part.stock}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-600">{formatDate(part.createdAt)}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <Badge 
                                                        className={part.isAvailable 
                                                            ? "bg-emerald-100 text-emerald-700" 
                                                            : "bg-red-100 text-red-700"
                                                        }
                                                    >
                                                        {part.isAvailable ? "Available" : "Unavailable"}
                                                    </Badge>
                                                    <Badge 
                                                        variant="outline"
                                                        className={part.status === "Active" 
                                                            ? "text-emerald-600 border-emerald-200" 
                                                            : part.status === "OutOfStock"
                                                            ? "text-red-600 border-red-200"
                                                            : "text-gray-600 border-gray-200"
                                                        }
                                                    >
                                                        {part.status}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Button
                                                    onClick={() => handleToggleAvailability(part._id, part.isAvailable)}
                                                    disabled={updatingAvailability[part._id]}
                                                    size="sm"
                                                    variant={part.isAvailable ? "outline" : "default"}
                                                    className={`flex items-center gap-2 ${
                                                        part.isAvailable 
                                                            ? "text-red-600 hover:bg-red-50" 
                                                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                                    }`}
                                                >
                                                    {updatingAvailability[part._id] ? (
                                                        <RefreshCw size={16} className="animate-spin" />
                                                    ) : part.isAvailable ? (
                                                        <EyeOff size={16} />
                                                    ) : (
                                                        <Eye size={16} />
                                                    )}
                                                    {part.isAvailable ? "Disable" : "Enable"}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredSpareParts.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Package size={32} className="text-slate-400" />
                                                    <span className="text-slate-500 text-sm">No spare parts found</span>
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

export default ManageSpareParts;