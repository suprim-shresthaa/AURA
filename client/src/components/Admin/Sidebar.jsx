import { Link, useLocation } from 'react-router-dom';
import { X, Home, Users, Calendar, Wrench, LogOut, Book, Package } from 'lucide-react';
import useLogout from '../../hooks/useLogout';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const logout = useLogout();

    const handleLogout = async () => {
        try {
          logout();
          setIsOpen(false);
        } catch (error) {
          console.error("Logout failed:", error);
        }
      };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin/dashboard' },
        { id: 'users', label: 'Manage Users', icon: Users, path: '/admin/users' },
        { id: 'reservations', label: 'Reservations', icon: Calendar, path: '/admin/reservations' },
        { id: 'orders', label: 'Orders', icon: Package, path: '/admin/orders' },
        { id: 'applications', label: 'Manage Applications', icon: Book, path: '/admin/applications' },
        { id: 'spare-parts', label: 'Spare Parts', icon: Wrench, path: '/admin/spare-parts' },
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-screen bg-gray-800 transition-transform duration-300 z-50 flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
          w-64`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">Admin</h2>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden text-white hover:bg-gray-700 p-2 rounded"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation - Scrollable area */}
                <nav className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                                            : 'text-gray-300 hover:bg-gray-700'
                                        }`}
                                >
                                    <Icon size={20} className="flex-shrink-0" />
                                    <span className="truncate">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Logout - Fixed at bottom */}
                <div className="p-4 border-t border-gray-700 flex-shrink-0">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-all">
                        <LogOut size={20} className="flex-shrink-0" />
                        <span className="truncate">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;