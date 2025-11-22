import mongoose from 'mongoose';

const tempUserSchema = new mongoose.Schema({
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
        minlength: [8, 'Password must be at least 8 characters long']
    },
    verifyOtp: {
        type: String,
        default: '',
        select: false
    },
    verifyOtpExpireAt: {
        type: Date,
        default: 0,
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60
    }
}, {
    timestamps: true
});

// Prevent duplicate email errors
tempUserSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000 && error.keyValue.email) {
        next(new Error('Email already exists'));
    } else {
        next(error);
    }
});

const TempUser = mongoose.model('TempUser', tempUserSchema);

export default TempUser;