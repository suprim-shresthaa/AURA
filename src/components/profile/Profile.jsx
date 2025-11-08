// Profile.js
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ProfileInfo from './ProfileInfo';
import AdoptedPets from './AdoptedPets';
import FavoritePets from './FavoritePets';
import Applications from './Applications';
import Settings from './Settings';

// Mock data for the user profile
const user = {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    joinDate: 'April 2023',
    bio: 'Animal lover and proud pet parent. I believe every pet deserves a loving home and am passionate about animal welfare and rescue.',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
    adoptedPets: [
        {
            id: 1,
            name: 'Bella',
            type: 'Dog',
            breed: 'Golden Retriever',
            age: '3 years',
            adoptedDate: 'April 15, 2023',
            image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=612&q=80'
        }
    ],
    favoritePets: [
        {
            id: 2,
            name: 'Luna',
            type: 'Cat',
            breed: 'Tabby',
            age: '1 year',
            status: 'Available',
            image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
        },
        {
            id: 3,
            name: 'Thumper',
            type: 'Rabbit',
            breed: 'Lop',
            age: '8 months',
            status: 'Available',
            image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
        }
    ],
    applications: [
        {
            id: 1,
            petName: 'Luna',
            status: 'In Review',
            submittedDate: 'June 10, 2024',
            petImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
        }
    ]
};

const Profile = () => {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-3">
                        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
                    </div>

                    {/* Main Content */}
                    <div className="mt-8 lg:mt-0 lg:col-span-9">
                        {activeTab === 'profile' && <ProfileInfo user={user} />}
                        {activeTab === 'adopted' && <AdoptedPets adoptedPets={user.adoptedPets} />}
                        {activeTab === 'favorites' && <FavoritePets favoritePets={user.favoritePets} />}
                        {activeTab === 'applications' && <Applications applications={user.applications} />}
                        {activeTab === 'settings' && <Settings />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;