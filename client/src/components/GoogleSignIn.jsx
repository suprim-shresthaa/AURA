import React, { useContext } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { AppContent } from './context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const GoogleSignIn = () => {
    const { backendUrl, setIsLoggedin, setUserData } = useContext(AppContent);
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        console.log('Google Sign-in successful:', credentialResponse);
        try {
            // Decode the JWT token from Google
            const decodedToken = jwtDecode(credentialResponse.credential);
            
            // Extract user information
            const googleUserData = {
                name: decodedToken.name,
                email: decodedToken.email,
                photo: decodedToken.picture,
                googleId: decodedToken.sub
            };

            // Send to backend
            const response = await axios.post(
                `${backendUrl}/api/auth/google`,
                googleUserData,
                { withCredentials: true }
            );

            if (response.data.success) {
                setIsLoggedin(true);
                setUserData(response.data.user);
                localStorage.setItem("user", JSON.stringify(response.data.user));
                
                toast.success("Google Sign-in successful!");
                navigate("/");
                window.location.reload();
            }
        } catch (error) {
            console.error('Google Sign-in error:', error);
            toast.error(error.response?.data?.message || "Google Sign-in failed");
        }
    };

    const handleGoogleError = () => {
        console.error('Google Sign-in failed');
        toast.error("Google Sign-in failed. Please try again.");
    };

    return (
        <div className="w-full flex justify-center">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                width="100%"
                text="signin_with"
            />
        </div>
    );
};

export default GoogleSignIn;