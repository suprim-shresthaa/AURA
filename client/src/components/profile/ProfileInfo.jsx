import React, { useContext, useEffect, useState } from "react";
import { Mail, Phone, MapPin, Edit, Save, X, User } from "lucide-react";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import InputField from "../InputField";

const ProfileInfo = () => {
  const { userData, setUserData, backendUrl } = useContext(AppContent);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    address: "",
  });

  // Sync values into form when edit mode opens
  useEffect(() => {
    if (isEditing && userData) {
      setFormData({
        name: userData.name || "",
        contact: userData.contact || "",
        address: userData.address || "",
      });
    }
  }, [isEditing, userData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendUrl}/api/user/edit/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          contact: formData.contact,
          address: formData.address,
        }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setUserData((prev) => ({
          ...prev,
          ...data.user,
          userId: data.user.userId ?? prev?.userId ?? prev?.id,
          id: data.user.userId ?? data.user.id ?? prev?.id,
        }));
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Update failed.");
      }
    } catch (err) {
      toast.error("Failed to update profile.");
      console.error(err);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Profile Information
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Update your personal details.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <Edit className="mr-1 h-4 w-4" /> Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="px-6 py-5 space-y-6">
        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* NAME */}
          <div>
            Full Name
            {isEditing ? (
              <InputField
                id="name"
                type="text"
                required
                name="name"
                placeholder="Your Full Name"
                value={formData.name}
                onChange={(e) => {
                  // Allow only letters and spaces
                  const lettersOnly = e.target.value.replace(
                    /[^a-zA-Z\s]/g,
                    "",
                  );
                  const value = lettersOnly.slice(0, 50);
                  setFormData({ ...formData, name: value });
                }}
                icon={<User className="w-5 h-5 text-gray-400" />}
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">
                {userData?.name || "N/A"}
              </p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <div className="mt-1 flex items-center text-sm text-gray-900">
              <Mail className="mr-2 h-4 w-4 text-gray-400" />
              {userData?.email || "N/A"}
            </div>
          </div>

          {/* PHONE */}
          <div>
            Phone
            {isEditing ? (
              <InputField
                id="contact"
                type="tel"
                minLength={10}
                maxLength={10}
                pattern="[0-9]*"
                required
                name="contact"
                placeholder="10-digit Phone Number"
                value={formData.contact}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData({ ...formData, contact: value });
                }}
                icon={<Phone className="w-5 h-5 text-gray-400" />}
              />
            ) : (
              <div className="mt-1 flex items-center text-sm text-gray-900">
                <Phone className="mr-2 h-4 w-4 text-gray-400" />
                {userData?.contact || "N/A"}
              </div>
            )}
          </div>

          {/* ADDRESS */}
          <div>
            Address
            {isEditing ? (
              <InputField
                id="address"
                type="text"
                required
                name="address"
                placeholder="Your Address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                icon={<MapPin className="w-5 h-5 text-gray-400" />}
              />
            ) : (
              <div className="mt-1 flex items-center text-sm text-gray-900">
                <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                {userData?.address || "N/A"}
              </div>
            )}
          </div>
        </div>

        {/* BUTTONS */}
        {isEditing && (
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              <Save className="mr-2 h-4 w-4" /> Save
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <X className="mr-2 h-4 w-4" /> Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileInfo;
