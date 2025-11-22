import { Link, useLocation } from 'react-router-dom';
import {
    Menu,
    X,
    Home,
    Users,
    Calendar,
    Wrench,
    LogOut,
    Book,
    List,
    LogOutIcon,
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/vendor/dashboard' },
        { id: 'listing', label: 'My Listing', icon: List, path: '/vendor/listings' },
        { id: 'reservations', label: 'Reservations', icon: Calendar, path: '/vendor/reservations' },
        { id: 'applications', label: 'Manage Applications', icon: Book, path: '/vendor/applications' },
    ];

    const handleLogout = () => {
        // Add your logout logic here
        console.log('Logging out...');
        // e.g., clear auth, redirect to login
    };

    const NavItem = ({ item }) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
            <Link
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
            >
                <Icon size={20} />
                <span
                    className={`text-sm font-medium transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'
                        } lg:static lg:opacity-100 ${isOpen ? 'block' : 'hidden'
                        }`}
                >
                    {item.label}
                </span>

                {/* Tooltip for collapsed state */}
                {!isOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        {item.label}
                    </div>
                )}
            </Link>
        );
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 lg:hidden z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed lg:static left-0 top-0 h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 transition-all duration-300 z-40 flex flex-col ${isOpen ? 'w-64' : 'w-0 lg:w-20'
                    } overflow-hidden`}
            >
                <div className="flex flex-col h-full p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 lg:justify-center">
                        <h1
                            className={`font-bold text-white text-xl transition-all duration-200 ${isOpen ? 'block' : 'hidden lg:block'
                                }`}
                        >
                            Admin
                        </h1>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="lg:hidden text-white hover:bg-gray-700 p-2 rounded"
                        >
                            {isOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {menuItems.map((item) => (
                            <NavItem key={item.id} item={item} />
                        ))}
                    </nav>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="group relative flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-all w-full"
                    >
                        <LogOut size={20} />
                        <span
                            className={`text-sm font-medium transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'
                                } lg:static lg:opacity-100 ${isOpen ? 'block' : 'hidden'
                                }`}
                        >
                            Logout
                        </span>

                        {/* Tooltip */}
                        {!isOpen && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                Logout
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;