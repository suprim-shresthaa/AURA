import bcrypt from 'bcryptjs';
import userModel from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import transporter from '../config/nodemailer.js';
import TempUser from '../models/tempUser.model.js';

import sendEmail from '../utils/emailTemplates.js';

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));


export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Name, email, and password are required'
        });
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered. Please login.'
            });
        }

        const existingTempUser = await TempUser.findOne({ email });
        if (existingTempUser) {
            await TempUser.deleteOne({ _id: existingTempUser._id });
        }

        const otp = generateOtp();
        const hashedPassword = await bcrypt.hash(password, 10);

        const tempUser = new TempUser({
            name,
            email,
            password: hashedPassword,
            verifyOtp: otp,
            verifyOtpExpireAt: Date.now() + 5 * 60 * 1000 // 5 minutes
        });

        await tempUser.save();

        await sendEmail(email, 'verify-email', { otp: otp });

        return res.status(201).json({
            success: true,
            message: 'Verification OTP sent to your email',
            isResend: !!existingTempUser
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const verifyEmail = async (req, res) => {
    const { email, otp } = req.body;

    console.log("Received:", req.body);

    if (!email || !otp || otp.length !== 6) {
        return res.status(400).json({
            success: false,
            message: 'Valid email and 6-digit OTP are required',
        });
    }

    try {
        const tempUser = await TempUser.findOne({ email }).select('+verifyOtp +verifyOtpExpireAt');

        if (!tempUser) {
            return res.status(404).json({
                success: false,
                message: 'No pending registration found. Please register again.',
            });
        }

        if (String(tempUser.verifyOtp).trim() !== String(otp).trim()) {
            console.log("DB OTP:", tempUser.verifyOtp);
            console.log("Entered OTP:", otp);
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP',
            });
        }

        if (tempUser.verifyOtpExpireAt < Date.now()) {
            await TempUser.findByIdAndDelete(tempUser._id);
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please register again.',
            });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            await TempUser.findByIdAndDelete(tempUser._id);
            return res.status(409).json({
                success: false,
                message: 'Account already exists. Please login.',
            });
        }

        const user = new userModel({
            name: tempUser.name,
            email: tempUser.email,
            password: tempUser.password,
            isAccountVerified: true,
        });

        await user.save();
        await TempUser.findByIdAndDelete(tempUser._id);

        return res.status(200).json({
            success: true,
            message: 'Account verified successfully!',
            user: {
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during verification',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};


export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    try {
        // Always hash the password to prevent timing attacks
        const dummyHash = await bcrypt.hash('dummy', 10);
        const user = await userModel.findOne({ email }).select('+password');

        const isMatch = user
            ? await bcrypt.compare(password, user.password)
            : await bcrypt.compare(password, dummyHash); // Compare with dummy if no user

        if (!user || !isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Check if user is banned
        if (user.banInfo.isBanned) {
            return res.status(403).json({
                success: false,
                message: 'Account is banned',
                banReason: user.banInfo.reason || 'No reason provided'
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only secure in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Use 'lax' for development
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: userData
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during login'
        });
    }
}


export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });

        return res.json({ success: true, message: "Logged Out" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};


export const sendVerifyOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const tempUser = await TempUser.findOne({ email });

        if (!tempUser) {
            return res.status(404).json({
                success: false,
                message: 'No pending registration found. Please register again.',
            });
        }

        // Generate new OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        tempUser.verifyOtp = otp;
        tempUser.verifyOtpExpireAt = Date.now() + 3 * 60 * 1000; // 3 minutes
        await tempUser.save();

        await sendEmail(email, 'resend-otp', { otp: otp });


        return res.status(200).json({
            success: true,
            message: 'A new OTP has been sent to your email.',
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while resending the OTP.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// Check if user is authenticated

export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


// Send OTP to email for password reset
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: "Email is required" });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 5 * 60 * 1000; // 5 minutes

        await user.save();

        await sendEmail(user.email, "password-reset-otp", { otp });

        return res.json({ success: true, message: "OTP sent to email" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const verifyResetOtp = async (req, res) => {
    const { email, otp } = req.body;


    if (!email || !otp) {
        return res.status(400).json({
            success: false,
            message: "Email and OTP are required",
        });
    }

    try {
        const user = await userModel.findOne({ email }).select("+resetOtp +resetOtpExpireAt");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.resetOtp != otp) {
            return res.status(401).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.status(410).json({
                success: false,
                message: "OTP expired",
            });
        }

        return res.status(200).json({
            success: true,
            message: "OTP verified",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Reset User Password
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    console.log("Received:", req.body);


    if (!email || !otp || !newPassword) {
        return res.json({
            success: false,
            message: "Email, OTP, and new password are required",
        });
    }

    try {
        const user = await userModel.findOne({ email }).select("+resetOtp +resetOtpExpireAt");
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (!user.resetOtp || user.resetOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "OTP expired" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({ success: true, message: "Password has been reset successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};


export const google = async (req, res, next) => {
    try {
        const { name, email, photo } = req.body;

        // Validate required fields
        if (!name || !email) {
            console.error("Missing required fields - Name:", name, "Email:", email);
            return res.status(400).json({
                success: false,
                message: "Name and Email are required"
            });
        }

        // Check if user exists
        const existingUser = await userModel.findOne({ email });

        // If user exists, check if they are banned
        if (existingUser) {
            if (existingUser.banInfo.isBanned) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is banned',
                    banReason: existingUser.banInfo.reason || 'No reason provided'
                });
            }

            // User exists and is not banned - generate token and respond
            const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
                expiresIn: '7d'
            });

            const userData = existingUser.toObject();
            delete userData.password;

            return res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                })
                .status(200)
                .json({
                    success: true,
                    user: userData
                });
        }

        // Create new user
        const generatedPassword = Math.random().toString(36).slice(-8) +
            Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        const newUser = new userModel({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            image: photo || undefined, // Use schema default if photo not provided
            isAccountVerified: true // Mark Google users as verified
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        const userData = newUser.toObject();
        delete userData.password;

        return res
            .cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            })
            .status(201)
            .json({
                success: true,
                user: userData
            });

    } catch (error) {
        console.error("Google Auth Error:", error);

        // Handle duplicate key error (unique email)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors).map(val => val.message)
            });
        }

        next(error);
    }
};