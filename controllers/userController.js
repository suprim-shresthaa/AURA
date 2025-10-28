import User from "../models/user.model.js";


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

        // If the user is a vendor, fetch additional data from the Vendor collection
        if (user.role === 'vendor') {
            const vendorData = await Vendor.findOne({ email: user.email });

            if (vendorData) {
                userData.vendorDetails = {
                    vendorId: vendorData._id,
                    organization: vendorData.organization,
                    contact: vendorData.contact,
                    address: vendorData.address,
                    description: vendorData.description,
                    pets: vendorData.pets, // Include pets data
                    adoptionRequests: vendorData.adoptionRequests, // Include adoption requests data
                };
            }
        }

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
