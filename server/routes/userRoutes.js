import express from 'express';
import { changePassword, getAllUsers, getUserData, updateProfileImage } from '../controllers/userController.js';
import userAuth from '../middlewares/userAuth.js';

const userRouter = express.Router();

userRouter.post('/data', userAuth, getUserData);
userRouter.get('/all-users', getAllUsers)
userRouter.put("/update-profile-img", updateProfileImage);
userRouter.post("/change-password", userAuth, changePassword);

export default userRouter;