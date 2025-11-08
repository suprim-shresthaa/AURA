import express from 'express';
import { getAllUsers, getUserData } from '../controllers/userController.js';
import userAuth from '../middlewares/userAuth.js';

const userRouter = express.Router();

userRouter.post('/data', userAuth, getUserData);
userRouter.get('/all-users', getAllUsers)

export default userRouter;