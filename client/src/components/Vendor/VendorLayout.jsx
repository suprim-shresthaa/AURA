import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const VendorLayout = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-md p-4 flex items-center justify-between lg:hidden">
                    <h1 className="text-xl font-bold">Vendor Dashboard</h1>
                    <button onClick={() => setIsOpen(true)}>
                        <Menu />
                    </button>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default VendorLayout;
