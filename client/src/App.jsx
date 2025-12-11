import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./Landing/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AdminDashboard from "./components/Admin/AdminDashboard";
import VendorApplicationForm from "./components/Vendor/VendorApplicationForm";
import ManageApplications from "./components/Admin/ManageApplications";
import ManageUsers from "./components/Admin/ManageUsers";
import ManageReservations from "./components/Admin/ManageReservations";
import VehicleUploadForm from "./components/Vendor/VehicleUploadForm";
import VehicleListing from "./components/VehiclesListing";
import Profile from "./components/profile/Profile";
import VendorDashboard from "./components/Vendor/VendorDashboard";
import MyVehicleListings from "./components/Vendor/MyVehicleListings";
import VendorReservations from "./components/Vendor/VendorReservations";
import VehicleDetailsPage from "./components/VehicleDetailsPage";
import Footer from "./components/Footer";
import SparePartsForm from "./components/Admin/SparePartsForm";
import SparePartsListing from "./components/SparePartsListing";
import SparePartDetailsPage from "./components/SparePartDetailsPage";
import AdminLayout from "./components/Admin/AdminLayout";
import PaymentTracking from "./components/Admin/PaymentTracking";
import PaymentCallback from "./components/PaymentCallback";
import EsewaCallbackHandler from "./components/EsewaCallbackHandler";
import "./App.css"; 

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Navbar />}

      <div className={`bg-slate-100 min-h-screen flex-1`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/vehicles" element={<VehicleListing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
          <Route path="/spare-parts" element={<SparePartsListing />} />
          <Route path="/payment/success" element={<PaymentCallback />} />
          <Route path="/payment/failed" element={<PaymentCallback />} />
          <Route path="/payment/cancelled" element={<PaymentCallback />} />
          <Route path="/payment/pending" element={<PaymentCallback />} />
          <Route path="/payment/esewa/success" element={<PaymentCallback />} />
          <Route path="/payment/esewa/failure" element={<PaymentCallback />} />
          <Route path="/api/payments/esewa/callback" element={<EsewaCallbackHandler />} />
          <Route path="/spare-parts/:id" element={<SparePartDetailsPage />} />

          <Route path="/vendor/apply" element={<VendorApplicationForm />} />
          <Route path="/vendor/vehicle-upload" element={<VehicleUploadForm />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/listings" element={<MyVehicleListings />} />
          <Route path="/vendor/reservations" element={<VendorReservations />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="reservations" element={<ManageReservations />} />
            <Route path="applications" element={<ManageApplications />} />
            <Route path="payments" element={<PaymentTracking />} />
            <Route path="add-spare-parts" element={<SparePartsForm />} />
          </Route>
        </Routes>
      </div>

      {!isAdminRoute && <Footer />}
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
