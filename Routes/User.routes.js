import express from "express";
import { createUser, loginUser, logoutUser, getUser, getAllCars, getCarById } from "../Controllers/User.controller.js";
import { protect } from "../Middleare/isAuth.js";

const userRouter = express.Router();

// Public routes
userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);
userRouter.get("/cars", getAllCars);
userRouter.get("/cars/:id", getCarById);

// Protected routes
userRouter.get("/me", protect, getUser);
userRouter.post("/logout", protect, logoutUser); 
export default userRouter;
