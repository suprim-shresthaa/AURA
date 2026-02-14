import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Car, DollarSign, Edit, Trash2, Plus, AlertCircle, Eye, Search, ToggleLeft, ToggleRight
} from 'lucide-react';
import { AppContent } from '../context/AppContext';
import ConfirmationModal from '../ui/ConfirmationModal';
import Sidebar from './Sidebar';

export default function MyVehicleListings() {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [updatingAvailability, setUpdatingAvailability] = useState({});

    const { userData } = useContext(AppContent);
    const vendorId = userData?.vendorId || userData?.userId || null;

    useEffect(() => {
        if (vendorId) fetchVehicles(vendorId);
    }, [vendorId]);

    const fetchVehicles = async (id) => {
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:5001/api/vehicles/vendor-vehicles?vendorId=${id}`);
            if (!res.ok) throw new Error(`Failed: ${res.status}`);
            const { data } = await res.json();
            setVehicles(data || []);
        } catch (err) {
            setError(err.message);
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!vehicleToDelete) return;
        setDeleting(true);
        try {
            const res = await fetch(`http://localhost:5001/api/vehicles/${vehicleToDelete}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || `Failed (${res.status})`);
            }
            setVehicles(prev => prev.filter(v => v._id !== vehicleToDelete));
        } catch (err) {
            alert(err.message || 'Delete failed');
        } finally {
            setDeleting(false);
            setModalOpen(false);
            setVehicleToDelete(null);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setVehicleToDelete(null);
    };

    const handleDelete = (id) => {
        setVehicleToDelete(id);
        setModalOpen(true);
    };

    const handleEdit = (id) => {
        navigate(`/vendor/vehicle-upload/${id}`);
    };
    const handleView = (id) => {
        navigate(`/vehicles/${id}`);
    };

    const handleToggleAvailability = async (vehicleId, currentAvailability) => {
        setUpdatingAvailability(prev => ({ ...prev, [vehicleId]: true }));
        try {
            const res = await fetch(`http://localhost:5001/api/vehicles/${vehicleId}/availability`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify({ isAvailable: !currentAvailability })
            });
            
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || `Failed (${res.status})`);
            }
            
            setVehicles(prev => 
                prev.map(vehicle => 
                    vehicle._id === vehicleId 
                        ? { ...vehicle, isAvailable: !currentAvailability }
                        : vehicle
                )
            );
        } catch (err) {
            alert(err.message || 'Failed to update availability');
        } finally {
            setUpdatingAvailability(prev => ({ ...prev, [vehicleId]: false }));
        }
    };

    const filteredVehicles = vehicles.filter(v => {
        const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' ||
            (filterStatus === 'available' && v.isAvailable) ||
            (filterStatus === 'rented' && !v.isAvailable);
        return matchesSearch && matchesFilter;
    }).sort((a, b) => {
        // Sort by verification status: pending first, then approved, then rejected
        const statusOrder = { pending: 0, approved: 1, rejected: 2 };
        return (statusOrder[a.verificationStatus] || 3) - (statusOrder[b.verificationStatus] || 3);
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
        <div className="flex min-h-screen  bg-gray-50">
            <Sidebar isOpen={true} setIsOpen={true} />
        <div className='flex flex-1 mx-4 mt-4 flex-col '>
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-2">My Vehicle Listings</h1>
                            <p className="text-slate-600">Manage and monitor your vehicle inventory</p>
                        </div>
                          <button
                        onClick={() => navigate('/vendor/vehicle-upload')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Car size={18} />
                        Add Vehicle
                    </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by vehicle name or category..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setFilterStatus('all')} className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>All</button>
                                <button onClick={() => setFilterStatus('available')} className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${filterStatus === 'available' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Available</button>
                                <button onClick={() => setFilterStatus('rented')} className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${filterStatus === 'rented' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Rented</button>
                            </div>
                        </div>
                    </div>
                </div>

                {filteredVehicles.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                        <Car className="mx-auto text-slate-400 mb-4" size={64} />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            {vehicles.length === 0 ? 'No vehicles yet' : 'No vehicles match your search'}
                        </h3>
                        <p className="text-slate-600 mb-6">
                            {vehicles.length === 0 ? 'Start by adding your first vehicle' : 'Try adjusting your search or filter'}
                        </p>
                        {vehicles.length === 0 && (
                            <button 
                                onClick={() => navigate('/vendor/vehicle-upload')}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl inline-flex items-center gap-2 font-medium shadow-lg"
                            >
                                <Plus size={20} /> Add Your First Vehicle
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                            <div className="grid grid-cols-12 gap-4 items-center font-semibold text-slate-700 text-sm">
                                <div className="col-span-4">Vehicle</div>
                                <div className="col-span-2">Category</div>
                                <div className="col-span-2">Price/Day</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-2 text-right">Actions</div>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-200">
                            {filteredVehicles.map(vehicle => (
                                <div key={vehicle._id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                                    {vehicle.verificationStatus === 'rejected' && vehicle.rejectionReason && (
                                        <div className="mb-3 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                                            <p className="text-sm font-semibold text-red-900 mb-1">Rejection Reason:</p>
                                            <p className="text-sm text-red-700">{vehicle.rejectionReason}</p>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-4 flex items-center gap-4">
                                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                                                {vehicle.mainImage ? (
                                                    <img src={vehicle.mainImage} alt={vehicle.name} className="w-full h-full object-cover" />
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

                                        <div className="col-span-2">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                                                {vehicle.category}
                                            </span>
                                        </div>

                                        <div className="col-span-2">
                                            <div className="flex items-center gap-1">
                                                <DollarSign size={18} className="text-blue-600" />
                                                <span className="text-lg font-bold text-slate-900">{vehicle.rentPerDay}</span>
                                                <span className="text-sm text-slate-500">/day</span>
                                            </div>
                                        </div>

                                        <div className="col-span-2">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${vehicle.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {vehicle.isAvailable ? 'Available' : 'Unavailable'}
                                                    </span>
                                                    {vehicle.verificationStatus === 'approved' && (
                                                        <button
                                                            onClick={() => handleToggleAvailability(vehicle._id, vehicle.isAvailable)}
                                                            disabled={updatingAvailability[vehicle._id]}
                                                            className="text-blue-600 hover:text-blue-800 p-1"
                                                            title={`${vehicle.isAvailable ? 'Disable' : 'Enable'} availability`}
                                                        >
                                                            {updatingAvailability[vehicle._id] ? (
                                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                                                            ) : vehicle.isAvailable ? (
                                                                <ToggleRight size={30} className="text-green-600" />
                                                            ) : (
                                                                <ToggleLeft size={30} className="text-red-600" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                                {vehicle.verificationStatus && (
                                                    <div>
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                            vehicle.verificationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                                            vehicle.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {vehicle.verificationStatus === 'approved' ? '✓ Approved' :
                                                             vehicle.verificationStatus === 'rejected' ? '✗ Rejected' :
                                                             '⏳ Pending'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-span-2 flex items-center justify-end gap-2">
                                            {vehicle.verificationStatus === 'approved' && (
                                                <button onClick={() => handleView(vehicle._id)} className="p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors" title="View Details">
                                                    <Eye size={18} />
                                                </button>
                                            )}
                                            {(vehicle.verificationStatus === 'rejected' || vehicle.verificationStatus === 'pending') && (
                                                <button onClick={() => handleEdit(vehicle._id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium" title={vehicle.verificationStatus === 'rejected' ? "Edit & Resubmit" : "Edit Vehicle"}>
                                                    <Edit size={18} />
                                                </button>
                                            )}
                                            {vehicle.verificationStatus === 'approved' && (
                                                <button onClick={() => handleEdit(vehicle._id)} className="p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors" title="Edit Vehicle">
                                                    <Edit size={18} />
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(vehicle._id)} className="p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="Delete Vehicle">
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
            <ConfirmationModal
                isOpen={modalOpen}
                onClose={closeModal}
                onConfirm={confirmDelete}
                title="Delete Vehicle"
                message="This action cannot be undone. The vehicle will be removed from your listings."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                loading={deleting}
            />
        </div>
    );
}