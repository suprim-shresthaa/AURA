import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import "./App.css"; 

export default function App() {
  return (
    <Router>
      <Navbar />

      {/* Add padding so content doesn't hide behind navbar */}
      <div className="pt-16 bg-slate-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/vehicles" element={<VehicleListing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
          <Route path="/spare-parts" element={<SparePartsListing />} />

          <Route path="/vendor/apply" element={<VendorApplicationForm />} />
          <Route path="/vendor/vehicle-upload" element={<VehicleUploadForm />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/listings" element={<MyVehicleListings />} />
          <Route path="/vendor/reservations" element={<VendorReservations />} />

          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/reservations" element={<ManageReservations />} />
          <Route path="/admin/applications" element={<ManageApplications />} />
          <Route path="/admin/add-spare-parts" element={<SparePartsForm />} />
        </Routes>
      </div>

      <Footer />
    </Router>
  );
}
