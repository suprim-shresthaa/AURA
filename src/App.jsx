import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./Landing/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AdminDashboard from "./components/Admin/AdminDashboard";
import VendorApplicationForm from "./components/Vendor/VendorApplicationForm";

export default function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/vendor/apply" element={<VendorApplicationForm />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
