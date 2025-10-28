import { Menu, X, Home, Users, Calendar, Wrench, LogOut } from 'lucide-react';
const Sidebar = ({ setPage, isOpen, setIsOpen, currentPage }) => {
    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: Users },
        { id: "users", label: "Manage Users", icon: Users },
        { id: "reservations", label: "Reservations", icon: Calendar },
        { id: "spare-parts", label: "Spare Parts", icon: Wrench },
    ];

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 lg:hidden z-30"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            <div
                className={`fixed lg:static left-0 top-0 h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 transition-all duration-300 z-40 ${isOpen ? "w-64" : "w-0 lg:w-20"
                    } overflow-hidden`}
            >
                <div className="flex flex-col h-full p-4">
                    <div className="flex items-center justify-between mb-8 lg:justify-center">
                        <h1 className={`font-bold text-white transition-all ${isOpen ? "text-xl" : "hidden"}`}>
                            Admin
                        </h1>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="lg:hidden text-white hover:bg-gray-700 p-2 rounded"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setPage(item.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentPage === item.id
                                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                                            : "text-gray-300 hover:bg-gray-700"
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className={`text-sm font-medium transition-all ${isOpen ? "block" : "hidden lg:hidden"}`}>
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>

                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-all">
                        <LogOut size={20} />
                        <span className={`text-sm font-medium ${isOpen ? "block" : "hidden lg:hidden"}`}>Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;