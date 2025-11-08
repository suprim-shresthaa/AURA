import React, { useState } from "react";
import { Building2, Mail, Phone, MapPin, IdCard, FileUp, Briefcase } from "lucide-react";
import { useContext } from "react";
import { AppContent } from '../context/AppContext'

const VendorApplicationForm = () => {
    const { userData } = useContext(AppContent)
    const [formData, setFormData] = useState({
        fullName: "",
        businessName: "",
        email: "",
        phone: "",
        address: "",
        businessType: "",
        govIdType: "",
        govIdNumber: "",
        idDocument: null,
    });


    console.log(userData?.userId);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();

        // Append all form fields
        Object.keys(formData).forEach((key) => {
            if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });

        // Append userId from context
        if (userData?.userId) {
            data.append("userId", userData.userId);
        } else {
            alert("User not authenticated. Please log in.");
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/api/vendors/register", {
                method: "POST",
                body: data,
                credentials: "include", 
            });

            const result = await res.json();
            if (result.success) {
                alert("Vendor Application Submitted Successfully!");
            } else {
                alert(result.message || "Something went wrong");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Submission failed!");
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 py-12 px-4">
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-600 to-teal-600 px-8 py-8 text-center">
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
                        <div>
                            <label className="block mb-2 font-semibold text-gray-700 text-sm">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-gray-700 text-sm">
                                Business / Company Name
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    placeholder="Business name (optional)"
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email & Phone - Two Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2 font-semibold text-gray-700 text-sm">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="example@email.com"
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-gray-700 text-sm">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter your phone number"
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address - Full Width */}
                    <div>
                        <label className="block mb-2 font-semibold text-gray-700 text-sm">
                            Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-4 text-gray-400" size={20} />
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Street, City, State, Zip"
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition resize-none"
                                rows="3"
                                required
                            ></textarea>
                        </div>
                    </div>

                    {/* Business Type & Gov ID Type - Two Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2 font-semibold text-gray-700 text-sm">
                                Business Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="businessType"
                                value={formData.businessType}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition bg-white"
                                required
                            >
                                <option value="">Select type</option>
                                <option value="individual">Individual</option>
                                <option value="company">Company</option>
                            </select>
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-gray-700 text-sm">
                                Government ID Type <span className="text-red-500">*</span>
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
                            Government ID Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
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
                            Upload ID Document <span className="text-red-500">*</span>
                        </label>
                        <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-teal-500 transition">
                            <div className="flex items-center justify-center">
                                <FileUp className="text-gray-400 mr-3" size={24} />
                                <input
                                    type="file"
                                    name="idDocument"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={handleChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    required
                                />
                                <div className="text-center">
                                    <p className="text-gray-600 font-medium">
                                        {formData.idDocument ? formData.idDocument.name : "Click to upload or drag and drop"}
                                    </p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        JPG, PNG or PDF (max. 5MB)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-teal-600 to-teal-600 hover:from-teal-700 hover:to-teal-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                        Submit Application
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VendorApplicationForm;