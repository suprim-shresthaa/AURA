import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false
    },

    // Verification and Reset OTP
    verifyOtp: {
        type: String,
        default: "",
        select: false
    },
    verifyOtpExpireAt: {
        type: Date,
        default: 0,
        select: false
    },
    isAccountVerified: {
        type: Boolean,
        default: false
    },
    resetOtp: {
        type: String,
        default: "",
        select: false
    },
    resetOtpExpireAt: {
        type: Date,
        default: 0,
        select: false
    },

    // Role and profile
    role: {
        type: String,
        enum: ['user', 'vendor', 'admin'],
        default: 'user'
    },
    contact: {
        type: String,
        default: "",
        match: [/^[0-9]{10}$/, 'Please fill a valid contact number']
    },

    address: {
        type: String,
        default: "",
        maxlength: [200, 'Address cannot exceed 200 characters']
    },
    image: {
        type: String,
        default: "https://res.cloudinary.com/dxigipf0k/image/upload/v1741190518/wy6ytirqcswljhf3c13v.png"
    },

    // Ban related fields (nested approach)
    banInfo: {
        isBanned: {
            type: Boolean,
            default: false
        },
        bannedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        reason: {
            type: String,
            default: ""
        },
        at: {
            type: Date,
            default: null
        },
        willBeUnbannedAt: {
            type: Date,
            default: null
        },
        unbannedAt: {
            type: Date,
            default: null
        },
        unbanReason: {
            type: String,
            default: ""
        },
        unbannedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
    },
},
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                delete ret.password;
                delete ret.verifyOtp;
                delete ret.verifyOtpExpireAt;
                delete ret.resetOtp;
                delete ret.resetOtpExpireAt;
                return ret;
            }
        },
        toObject: {
            virtuals: true
        }
    });

// Prevent duplicate email errors
userSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000 && error.keyValue.email) {
        next(new Error('Email already exists'));
    } else {
        next(error);
    }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;