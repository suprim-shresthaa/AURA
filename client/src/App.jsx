import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar";
import Home from "./Landing/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ResetPassword from "./components/ResetPassword";
import AdminDashboard from "./components/Admin/AdminDashboard";
import VendorApplicationForm from "./components/Vendor/VendorApplicationForm";
import ManageApplications from "./components/Admin/ManageApplications";
import ManageUsers from "./components/Admin/ManageUsers";
import ManageReservations from "./components/Admin/ManageReservations";
import ManageVehicles from "./components/Admin/ManageVehicles";
import ManageLicenses from "./components/Admin/ManageLicenses";
import ManageSpareParts from "./components/Admin/ManageSpareParts";
import AdminVehicleDetailsPage from "./components/Admin/AdminVehicleDetailsPage";
import VehicleUploadForm from "./components/Vendor/VehicleUploadForm";
import VehicleListing from "./components/VehiclesListing";
import Profile from "./components/profile/Profile";
import ProfileInfo from "./components/profile/ProfileInfo";
import Bookings from "./components/profile/Bookings";
import Licenses from "./components/profile/Licenses";
import Settings from "./components/profile/Settings";
import VendorDashboard from "./components/Vendor/VendorDashboard";
import MyVehicleListings from "./components/Vendor/MyVehicleListings";
import VendorReservations from "./components/Vendor/VendorReservations";
import VehicleDetailsPage from "./components/VehicleDetailsPage";
import Footer from "./components/Footer";
import SparePartsForm from "./components/Admin/SparePartsForm";
import SparePartsListing from "./components/SparePartsListing";
import SparePartDetailsPage from "./components/SparePartDetailsPage";
import AdminLayout from "./components/Admin/AdminLayout";
import VendorLayout from "./components/Vendor/VendorLayout";
import PaymentCallback from "./components/PaymentCallback";
import "./App.css"; 
import InsuranceTerms from "./components/InsuranceTerms";
import BookingTerms from "./components/BookingTerms";

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Navbar />}

      <div className={`bg-slate-100 min-h-screen flex-1`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/insurance-terms' element={<InsuranceTerms />} />
          <Route path='/booking-terms' element={<BookingTerms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/vehicles" element={<VehicleListing />} />
          <Route path="/profile" element={<Profile />}>
            <Route index element={<ProfileInfo />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="licenses" element={<Licenses />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
          <Route path="/spare-parts" element={<SparePartsListing />} />
          <Route path="/spare-parts/:id" element={<SparePartDetailsPage />} />
          <Route path="/payment/success" element={<PaymentCallback />} />
          <Route path="/payment/failed" element={<PaymentCallback />} />
          <Route path="/payment/cancelled" element={<PaymentCallback />} />
          <Route path="/payment/pending" element={<PaymentCallback />} />
          
          <Route path="/vendor/apply" element={<VendorApplicationForm />} />
          <Route path="/vendor/vehicle-upload" element={<VehicleUploadForm />} />
          <Route path="/vendor/vehicle-upload/:id" element={<VehicleUploadForm />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/listings" element={<MyVehicleListings />} />
          <Route path="/vendor/reservations" element={<VendorReservations />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="reservations" element={<ManageReservations />} />
            <Route path="applications" element={<ManageApplications />} />
            <Route path="vehicles" element={<ManageVehicles />} />
            <Route path="vehicles/:id" element={<AdminVehicleDetailsPage />} />
            <Route path="licenses" element={<ManageLicenses />} />
            <Route path="spare-parts" element={<ManageSpareParts />} />
            <Route path="add-spare-parts" element={<SparePartsForm />} />
          </Route>
        </Routes>
      </div>

      {!isAdminRoute && <Footer />}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
