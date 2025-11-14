import React, { useState, useEffect, useContext } from 'react';
import { Car, MapPin, DollarSign, Users, Fuel, Settings, Edit, Trash2, Plus, AlertCircle, Eye, MoreVertical, Search, Filter } from 'lucide-react';
import { AppContent } from '../context/AppContext';

export default function MyVehicleListings() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [openDropdown, setOpenDropdown] = useState(null);

    const { userData } = useContext(AppContent);
    const vendorId = userData?.vendorId || userData?.userId || null;

    useEffect(() => {
        if (!vendorId) return;
        fetchVehicles(vendorId);
    }, [vendorId]);

    const fetchVehicles = async (vendorId) => {
        try {
            setLoading(true);

            const url = `http://localhost:3000/api/vehicles/vendor-vehicles?vendorId=${vendorId}`;
            const response = await fetch(url);

            if (!response.ok) throw new Error(`Failed to fetch vehicles: ${response.status}`);

            const result = await response.json();
            setVehicles(result.data || []);
            setError(null);

        } catch (err) {
            console.error("Error fetching vehicles:", err);
            setError(err.message);
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (vehicleId) => {
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            console.log("Delete vehicle:", vehicleId);
            setVehicles(vehicles.filter(v => v._id !== vehicleId));
        }
        setOpenDropdown(null);
    };

    const handleEdit = (vehicleId) => {
        console.log("Edit vehicle:", vehicleId);
        setOpenDropdown(null);
    };

    const handleView = (vehicleId) => {
        console.log("View vehicle:", vehicleId);
        setOpenDropdown(null);
    };

    const filteredVehicles = vehicles.filter(vehicle => {
        const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' ||
            (filterStatus === 'available' && vehicle.isAvailable) ||
            (filterStatus === 'rented' && !vehicle.isAvailable);
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading your vehicles...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 flex items-start gap-4 shadow-sm">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
                        <div>
                            <h3 className="font-semibold text-red-900 text-lg">Error Loading Vehicles</h3>
                            <p className="text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-7xl mx-auto p-6">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-2">My Vehicle Listings</h1>
                            <p className="text-slate-600">Manage and monitor your vehicle inventory</p>
                        </div>

                        <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all font-medium">
                            <Plus size={20} /> Add New Vehicle
                        </button>
                    </div>

                    {/* Stats Cards
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-600 text-sm font-medium mb-1">Total Vehicles</p>
                                    <p className="text-3xl font-bold text-slate-900">{vehicles.length}</p>
                                </div>
                                <div className="bg-blue-100 p-4 rounded-xl">
                                    <Car className="text-blue-600" size={28} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-600 text-sm font-medium mb-1">Available</p>
                                    <p className="text-3xl font-bold text-green-600">
                                        {vehicles.filter(v => v.isAvailable).length}
                                    </p>
                                </div>
                                <div className="bg-green-100 p-4 rounded-xl">
                                    <Settings className="text-green-600" size={28} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-600 text-sm font-medium mb-1">Rented Out</p>
                                    <p className="text-3xl font-bold text-orange-600">
                                        {vehicles.filter(v => !v.isAvailable).length}
                                    </p>
                                </div>
                                <div className="bg-orange-100 p-4 rounded-xl">
                                    <Users className="text-orange-600" size={28} />
                                </div>
                            </div>
                        </div>
                    </div> */}

                    {/* Search and Filter */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by vehicle name or category..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${filterStatus === 'all'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilterStatus('available')}
                                    className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${filterStatus === 'available'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    Available
                                </button>
                                <button
                                    onClick={() => setFilterStatus('rented')}
                                    className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${filterStatus === 'rented'
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    Rented
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vehicle List/Table */}
                {filteredVehicles.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                        <Car className="mx-auto text-slate-400 mb-4" size={64} />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            {vehicles.length === 0 ? 'No vehicles yet' : 'No vehicles match your search'}
                        </h3>
                        <p className="text-slate-600 mb-6">
                            {vehicles.length === 0
                                ? 'Start by adding your first vehicle to the platform'
                                : 'Try adjusting your search or filter criteria'
                            }
                        </p>

                        {vehicles.length === 0 && (
                            <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl inline-flex items-center gap-2 font-medium shadow-lg">
                                <Plus size={20} /> Add Your First Vehicle
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Table Header */}
                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                            <div className="grid grid-cols-12 gap-4 items-center font-semibold text-slate-700 text-sm">
                                <div className="col-span-4">Vehicle</div>
                                <div className="col-span-2">Category</div>
                                <div className="col-span-2">Price/Day</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-2 text-right">Actions</div>
                            </div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-slate-200">
                            {filteredVehicles.map((vehicle) => (
                                <div key={vehicle._id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        {/* Vehicle Info */}
                                        <div className="col-span-4 flex items-center gap-4">
                                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                                                {vehicle.mainImage ? (
                                                    <img
                                                        src={vehicle.mainImage}
                                                        alt={vehicle.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full">
                                                        <Car className="text-slate-400" size={32} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 mb-1">{vehicle.name}</h3>
                                                <p className="text-sm text-slate-500">{vehicle.modelYear}</p>
                                            </div>
                                        </div>

                                        {/* Category */}
                                        <div className="col-span-2">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                                                {vehicle.category}
                                            </span>
                                        </div>

                                        {/* Price */}
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-1">
                                                <DollarSign size={18} className="text-blue-600" />
                                                <span className="text-lg font-bold text-slate-900">{vehicle.rentPerDay}</span>
                                                <span className="text-sm text-slate-500">/day</span>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="col-span-2">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${vehicle.isAvailable
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {vehicle.isAvailable ? 'Available' : 'Rented'}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="col-span-2 flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleView(vehicle._id)}
                                                className="p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(vehicle._id)}
                                                className="p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                                title="Edit Vehicle"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(vehicle._id)}
                                                className="p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                                title="Delete Vehicle"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}