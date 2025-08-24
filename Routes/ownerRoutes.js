import express from "express";
import { addCar, deleteCar, getDashboardData, getOwnerCars, toggleCarAvailability, updateUserImage } from "../Controllers/owner.controller.js";
import { protect } from "../Middleare/isAuth.js";
import upload from "../Middleare/multer.js";

const ownerRouter = express.Router();

ownerRouter.post("/add-car", protect, upload.single("image"), addCar);
ownerRouter.get("/cars", protect, getOwnerCars); 
ownerRouter.post("/toggle-car", protect, toggleCarAvailability);
ownerRouter.post("/delete-car", protect, deleteCar);
ownerRouter.get("/dashboard", protect, getDashboardData);
ownerRouter.post("/update-image", protect, upload.single("image"), updateUserImage);

export default ownerRouter;
