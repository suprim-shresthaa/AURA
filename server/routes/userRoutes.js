import express from 'express';
import { changePassword, getAllUsers, getUserData, updateProfileImage, uploadLicense, getMyLicenses } from '../controllers/userController.js';
import userAuth from '../middlewares/userAuth.js';
import { upload } from '../config/cloudinary.js';

const userRouter = express.Router();

userRouter.post('/data', userAuth, getUserData);
userRouter.get('/all-users', getAllUsers)
userRouter.put("/update-profile-img", updateProfileImage);
userRouter.post("/change-password", userAuth, changePassword);

// License routes
const licenseUpload = upload.fields([{ name: "licenseImage", maxCount: 1 }]);
userRouter.post("/license/upload", userAuth, licenseUpload, uploadLicense);
userRouter.get("/license/my-licenses", userAuth, getMyLicenses);

export default userRouter;