import React, { useEffect, useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  IdCard,
  FileUp,
  Briefcase,
} from "lucide-react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import Navbar from "../Navbar";
import InputField from "../InputField";

const VendorApplicationForm = () => {
  const navigate = useNavigate();
  const { userData } = useContext(AppContent);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: userData?.name,
    businessName: userData?.businessName,
    email: userData?.email,
    phone: userData?.phone,
    address: userData?.address,
    businessType: userData?.businessType,
    govIdType: userData?.govIdType,
    govIdNumber: userData?.govIdNumber,
    idDocument: null,
  });

  useEffect(() => {
    if (!userData) return;

    setFormData((prev) => ({
      ...prev,
      fullName: userData?.name ?? "",
      businessName: userData?.businessName ?? "",
      email: userData?.email ?? "",
      phone: userData?.phone ?? "",
      address: userData?.address ?? "",
      businessType: userData?.businessType ?? "",
      govIdType: userData?.govIdType ?? "",
      govIdNumber: userData?.govIdNumber ?? "",
    }));
  }, [userData]);
  const ALLOWED_VENDOR_APPLICATION_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      if (!ALLOWED_VENDOR_APPLICATION_IMAGE_TYPES.includes(files[0].type)) {
        toast.error("Please upload a JPG, JPEG or PNG image only.");
        e.target.value = "";
        setFormData({ ...formData, [name]: null });
        return;
      }
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData();

    // Append all form fields
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    // Append userId from context
    if (!userData?.userId) {
      toast.error("Please log in to submit a vendor application.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/vendors/register", {
        method: "POST",
        body: data,
        credentials: "include",
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Vendor Application Submitted Successfully!");
        navigate("/profile");
      } else {
        toast.error(result.message || "Something went wrong");
      }
    } catch (err) {
      console.log(err);
      // toast.error("Submission failed!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mt-10 mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-center">
          <div className="flex justify-center mb-3">
            <Briefcase className="text-white" size={48} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Vendor Application
          </h2>
          <p className="text-teal-100 text-sm">
            Join our network of trusted vendors
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Full Name & Business Name - Two Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <InputField
                id="fullName"
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
                icon={<IdCard className="w-5 h-5 text-gray-400" />}
              />
            </div>

            <div>
              <InputField
                id="businessName"
                label="Business / Company Name"
                placeholder="Business name (optional)"
                value={formData.businessName}
                onChange={handleChange}
                icon={<Building2 className="w-5 h-5 text-gray-400" />}
              />
            </div>
          </div>

          {/* Email & Phone - Two Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InputField
                id="email"
                label="Email Address"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                icon={<Mail className="w-5 h-5 text-gray-400" />}
              />
            </div>

            <div>
              <InputField
                id="phone"
                label="Phone Number"
                type="tel"
                minLength={10}
                maxLength={10}
                pattern="[0-9]*"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
                icon={<Phone className="w-5 h-5 text-gray-400" />}
              />
            </div>
          </div>

          {/* Address - Full Width */}
          <div>
            <InputField
              id="address"
              label="Address"
              placeholder="Street, City, State, Zip"
              value={formData.address}
              onChange={handleChange}
              required
              icon={<MapPin className="w-5 h-5 text-gray-400" />}
            />
          </div>

          {/* Business Type & Gov ID Type - Two Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-700 text-sm">
                Business Type <span className="text-gray-500">*</span>
              </label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition bg-white"
                required
              >
                <option value="">Select business type</option>
                <option value="individual">Individual</option>
                <option value="company">Company</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700 text-sm">
                Government ID Type <span className="text-gray-500">*</span>
              </label>
              <select
                name="govIdType"
                value={formData.govIdType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition bg-white"
                required
              >
                <option value="">Select ID type</option>
                <option value="citizenship">Citizenship</option>
                <option value="license">Driving License</option>
                <option value="passport">Passport</option>
              </select>
            </div>
          </div>

          {/* Government ID Number - Full Width */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Government ID Number <span className="text-gray-500">*</span>
            </label>
            <input
              type="number"
              name="govIdNumber"
              value={formData.govIdNumber}
              onChange={handleChange}
              placeholder="Enter your ID number"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          {/* Upload ID Document - Full Width */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Upload ID Document <span className="text-gray-500">*</span>
            </label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-teal-500 transition">
              <div className="flex items-center justify-center">
                <FileUp className="text-gray-400 mr-3" size={24} />
                <input
                  type="file"
                  name="idDocument"
                  accept="image/jpeg, image/png, image/jpg"
                  onChange={handleChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <div className="text-center">
                  <p className="text-gray-600 font-medium">
                    {formData.idDocument
                      ? formData.idDocument.name
                      : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    JPG, PNG, JPEG or PDF (max. 5MB)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-white font-semibold py-3 rounded-xl cursor-pointer h-16"
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VendorApplicationForm;
