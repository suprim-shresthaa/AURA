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
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation(); // <-- current path

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin/dashboard' },
        { id: 'users', label: 'Manage Users', icon: Users, path: '/admin/users' },
        {
            id: 'reservations',
            label: 'Reservations',
            icon: Calendar,
            path: '/admin/reservations',
        },
        {
            id: 'applications',
            label: 'Manage Applications',
            icon: Book,
            path: '/admin/applications',
        },
        {
            id: 'spare-parts',
            label: 'Spare Parts',
            icon: Wrench,
            path: '/admin/spare-parts',
        },
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 lg:hidden z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed lg:static left-0 top-0 h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 transition-all duration-300 z-40 ${isOpen ? 'w-64' : 'w-0 lg:w-20'
                    } overflow-hidden`}
            >
                <div className="flex flex-col h-full p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 lg:justify-center">
                        <h1
                            className={`font-bold text-white transition-all ${isOpen ? 'text-xl' : 'hidden'
                                }`}
                        >
                            Admin
                        </h1>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="lg:hidden text-white hover:bg-gray-700 p-2 rounded"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)} // close on mobile
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                                            : 'text-gray-300 hover:bg-gray-700'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span
                                        className={`text-sm font-medium transition-all ${isOpen ? 'block' : 'hidden lg:hidden'
                                            }`}
                                    >
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout (still a button – you can replace with <Link> if you have a logout route) */}
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-all">
                        <LogOut size={20} />
                        <span
                            className={`text-sm font-medium ${isOpen ? 'block' : 'hidden lg:hidden'
                                }`}
                        >
                            Logout
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;