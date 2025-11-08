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

export default function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/vehicles" element={<VehicleListing />} />

        <Route path="/vendor/apply" element={<VendorApplicationForm />} />
        <Route path="/vendor/vehicle-upload" element={<VehicleUploadForm />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/reservations" element={<ManageReservations />} />
        <Route path="/admin/applications" element={<ManageApplications />} />
        {/* <Route path="/admin/spare-parts" element={<AdminDashboard />} /> */}
      </Routes>
    </Router>
  );
}
