import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    Users,
    Calendar,
    Wrench,
    LogOut,
    Book,
    Car,
    FileText,
    ArrowLeft,
    UserCircle,
} from 'lucide-react';
import useLogout from '../../hooks/useLogout';
import { toast } from 'react-toastify';

function isNavActive(pathname, path) {
    if (path === '/admin/dashboard') {
        return pathname === '/admin/dashboard' || pathname === '/admin';
    }
    return pathname === path || pathname.startsWith(`${path}/`);
}

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const logout = useLogout();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin/dashboard' },
        { id: 'users', label: 'Manage Users', icon: Users, path: '/admin/users' },
        { id: 'reservations', label: 'Reservations', icon: Calendar, path: '/admin/reservations' },
        { id: 'applications', label: 'Applications', icon: Book, path: '/admin/applications' },
        { id: 'vehicles', label: 'Manage Vehicles', icon: Car, path: '/admin/vehicles' },
        { id: 'licenses', label: 'Manage Licenses', icon: FileText, path: '/admin/licenses' },
        { id: 'spare-parts', label: 'Manage Spare Parts', icon: Wrench, path: '/admin/spare-parts' },
        { id: 'profile', label: 'My Profile', icon: UserCircle, path: '/profile' },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    const NavItem = ({ item }) => {
        const Icon = item.icon;
        const isActive = isNavActive(location.pathname, item.path);

        return (
            <Link
                to={item.path}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700'
                }`}
            >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
            </Link>
        );
    };

    return (
        <aside className="w-64 shrink-0 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
            <div className="flex flex-col h-full min-h-0 p-4">
                <div className="flex items-center mb-6">
                    <Link to="/" className="text-white hover:text-gray-300 text-sm">
                        <ArrowLeft className="w-4 h-4 inline-block mr-2" size={20} /> Back to Home
                    </Link>
                </div>

                <h1 className="font-bold text-white text-xl mb-8">Admin Dashboard</h1>

                <nav className="flex-1 space-y-2 overflow-y-auto min-h-0">
                    {menuItems.map((item) => (
                        <NavItem key={item.id} item={item} />
                    ))}
                </nav>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-all w-full"
                >
                    <LogOut size={20} />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
