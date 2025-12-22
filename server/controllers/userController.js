import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { validatePassword } from '../utils/passwordValidator.js';
import sendEmail from '../utils/emailTemplates.js';


export const getUserData = async (req, res) => {
    try {
        const { userId } = req.body;

        // Ensure userId is provided
        if (!userId) {
            return res.json({ success: false, message: 'User ID is required' });
        }

        // Find user by the provided userId
        const user = await User.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Initialize user data object
        const userData = {
            userId: user._id,
            name: user.name,
            email: user.email,
            isAccountVerified: user.isAccountVerified,
            role: user.role,
            image: user.image,
            contact: user.contact,
            address: user.address,
            banInfo: user.banInfo,
        };

        // Return the user data
        res.json({
            success: true,
            userData,
        });

    } catch (error) {
        // Return the error message in the response
        res.json({ success: false, message: error.message });
    }
};


export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ success: true, data: users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Profile Controller
export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, contact, address } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated."
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // Update fields if provided
        if (name !== undefined) {
            user.name = name.trim();
        }
        if (contact !== undefined) {
            // Validate contact number format (10 digits)
            if (!/^[0-9]{10}$/.test(contact)) {
                return res.status(400).json({
                    success: false,
                    message: 'Contact must be a valid 10-digit number'
                });
            }
            user.contact = contact;
        }
        if (address !== undefined) {
            user.address = address.trim();
        }

        await user.save();

        // Return updated user data
        const userData = {
            userId: user._id,
            name: user.name,
            email: user.email,
            isAccountVerified: user.isAccountVerified,
            role: user.role,
            image: user.image,
            contact: user.contact,
            address: user.address,
            banInfo: user.banInfo,
        };

        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: userData,
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({
            success: false,
            message: "Server error. Please try again later.",
        });
    }
};


export const updateProfileImage = async (req, res) => {
    try {
        const userId = req.userId;

        // Check if file was uploaded
        if (req.file) {
            // File upload via multer
            const imageUrl = req.file.path;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }
            
            user.image = imageUrl;
            await user.save();

            return res.status(200).json({
                success: true,
                message: "Profile image updated successfully.",
                image: user.image,
            });
        }  else {
            return res.status(400).json({
                success: false,
                message: "Image file is required."
            });
        }
    } catch (error) {
        console.error("Error updating profile image:", error);
        res.status(500).json({
            success: false,
            message: "Server error. Please try again later.",
        });
    }
};

export const changePassword = async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;

    try {
        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields."
            });
        }

        // Validate password strength
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: passwordValidation.errors.join(', ')
            });
        }

        console.log("Received:", req.body);

        // MUST explicitly select password
        const user = await User.findById(userId).select("+password");

        console.log("User found:", user);
        console.log("Old Password:", oldPassword);
        console.log("User Password:", user?.password);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // Compare old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Old password is incorrect."
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Save new password
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully."
        });

    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

/**
 * Upload license for one or more vehicle types
 */
export const uploadLicense = async (req, res) => {
    try {
        const userId = req.userId;
        let vehicleTypes = req.body.vehicleTypes;

        // Handle FormData arrays - multer/express may parse multiple values with same key as array or string
        if (!vehicleTypes) {
            // Check for array notation (vehicleTypes[])
            if (req.body['vehicleTypes[]']) {
                vehicleTypes = req.body['vehicleTypes[]'];
            } else if (req.body.vehicleType) {
                // Backward compatibility: single vehicleType
                vehicleTypes = [req.body.vehicleType];
            } else {
                vehicleTypes = [];
            }
        }

        // Ensure it's an array
        // When multiple values are sent with same key, Express may return array or string
        if (typeof vehicleTypes === 'string') {
            vehicleTypes = [vehicleTypes];
        } else if (!Array.isArray(vehicleTypes)) {
            vehicleTypes = [];
        }

        const validVehicleTypes = ["Car", "Bike", "Scooter", "Jeep", "Van"];

        // Validate vehicle types
        if (vehicleTypes.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one vehicle type is required"
            });
        }

        // Check if all vehicle types are valid
        const invalidTypes = vehicleTypes.filter(type => !validVehicleTypes.includes(type));
        if (invalidTypes.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Invalid vehicle type(s): ${invalidTypes.join(", ")}. Valid types are: ${validVehicleTypes.join(", ")}`
            });
        }

        // Remove duplicates
        vehicleTypes = [...new Set(vehicleTypes)];

        if (!req.files?.licenseImage?.[0]) {
            return res.status(400).json({
                success: false,
                message: "License image is required"
            });
        }

        const licenseImage = req.files.licenseImage[0].path;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check for existing licenses (pending or approved) for each vehicle type
        const existingLicenses = [];
        const typesToAdd = [];

        for (const vehicleType of vehicleTypes) {
            // Check if any license (pending or approved) includes this vehicle type
            const existingLicense = user.licenses.find(
                license => license.vehicleTypes.includes(vehicleType) && license.status !== "rejected"
            );

            if (existingLicense) {
                existingLicenses.push({
                    type: vehicleType,
                    status: existingLicense.status
                });
            } else {
                typesToAdd.push(vehicleType);
            }
        }

        // If all types already have licenses, return error
        if (typesToAdd.length === 0) {
            const existingMessages = existingLicenses.map(
                lic => `${lic.type} (${lic.status})`
            ).join(", ");
            return res.status(400).json({
                success: false,
                message: `You already have licenses for all selected vehicle types: ${existingMessages}. Please wait for admin approval or update the existing licenses.`
            });
        }

        // Check if there's a rejected license with the same vehicle types (for re-upload scenario)
        const rejectedLicenseIndex = user.licenses.findIndex(
            license => license.status === "rejected" && 
                      JSON.stringify([...license.vehicleTypes].sort()) === JSON.stringify([...typesToAdd].sort())
        );

        let updatedLicense = null;

        if (rejectedLicenseIndex !== -1) {
            // Update existing rejected license instead of creating new one
            const rejectedLicense = user.licenses[rejectedLicenseIndex];
            rejectedLicense.vehicleTypes = typesToAdd;
            rejectedLicense.licenseImage = licenseImage;
            rejectedLicense.status = "pending";
            rejectedLicense.rejectionReason = "";
            rejectedLicense.approvedBy = null;
            rejectedLicense.approvedAt = null;
            rejectedLicense.uploadedAt = new Date();
            updatedLicense = rejectedLicense;
        } else {
            // Check if there's a rejected license with the same image and overlapping vehicle types
            // If yes, update it; otherwise create new
            const rejectedLicenseWithSameImage = user.licenses.find(
                license => license.status === "rejected" && 
                          license.licenseImage === licenseImage &&
                          typesToAdd.some(type => license.vehicleTypes.includes(type))
            );

            if (rejectedLicenseWithSameImage) {
                // Update existing rejected license - merge vehicle types
                const existingRejectedTypes = rejectedLicenseWithSameImage.vehicleTypes || [];
                const mergedTypes = [...new Set([...existingRejectedTypes, ...typesToAdd])];
                
                rejectedLicenseWithSameImage.vehicleTypes = mergedTypes;
                rejectedLicenseWithSameImage.licenseImage = licenseImage;
                rejectedLicenseWithSameImage.status = "pending";
                rejectedLicenseWithSameImage.rejectionReason = "";
                rejectedLicenseWithSameImage.approvedBy = null;
                rejectedLicenseWithSameImage.approvedAt = null;
                rejectedLicenseWithSameImage.uploadedAt = new Date();
                updatedLicense = rejectedLicenseWithSameImage;
            } else {
                // Create a new license entry with all vehicle types
                const newLicense = {
                    vehicleTypes: typesToAdd,
                    licenseImage,
                    status: "pending",
                    uploadedAt: new Date()
                };
                user.licenses.push(newLicense);
                updatedLicense = newLicense;
            }
        }

        await user.save();

        // Send email notification to all admins
        try {
            const adminEmail = process.env.SENDER_EMAIL;
            
            if (adminEmail) {
                const vehicleTypesStr = typesToAdd.join(", ");
                await sendEmail(adminEmail, 'license-uploaded', {
                    userName: user.name,
                    vehicleTypes: vehicleTypesStr
                });
            }
        } catch (emailError) {
            console.error('Error sending license upload notification to admins:', emailError);
            // Don't fail the request if email fails
        }

        const successMessage = typesToAdd.length === 1
            ? `License uploaded successfully for ${typesToAdd[0]}. It will be reviewed by an admin.`
            : `License uploaded successfully for ${typesToAdd.length} vehicle types (${typesToAdd.join(", ")}). It will be reviewed by an admin.`;

        if (existingLicenses.length > 0) {
            const existingMessage = ` Note: Some vehicle types already have licenses and were skipped.`;
            return res.status(201).json({
                success: true,
                message: successMessage + existingMessage,
                data: updatedLicense,
                skipped: existingLicenses
            });
        }

        res.status(201).json({
            success: true,
            message: successMessage,
            data: updatedLicense
        });
    } catch (error) {
        console.error("Error uploading license:", error);
        res.status(500).json({
            success: false,
            message: "Failed to upload license",
            error: error.message
        });
    }
};

/**
 * Get user's licenses
 */
export const getMyLicenses = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId).select("licenses");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Expand licenses with multiple vehicleTypes into individual entries for frontend compatibility
        const expandedLicenses = [];
        user.licenses.forEach(license => {
            const vehicleTypes = license.vehicleTypes || [];
            vehicleTypes.forEach(vehicleType => {
                expandedLicenses.push({
                    ...license.toObject(),
                    vehicleType: vehicleType, // Add singular for backward compatibility
                    vehicleTypes: vehicleTypes // Keep array for reference
                });
            });
        });

        res.json({
            success: true,
            data: expandedLicenses
        });
    } catch (error) {
        console.error("Error fetching licenses:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch licenses",
            error: error.message
        });
    }
};
