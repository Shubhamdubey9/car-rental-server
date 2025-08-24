import express from "express";
import {
  changeBookingStatus,
  checkAvailabilityOfCar,
  createBooking,
  getOwnerBookings,
  getUserBookings
} from "../Controllers/booking.controller.js";
import { protect } from "../Middleare/isAuth.js";

const bookingRouter = express.Router();


bookingRouter.post("/check-availability-of-car", protect, checkAvailabilityOfCar);
bookingRouter.post("/create", protect, createBooking);
bookingRouter.get("/user", protect, getUserBookings);
bookingRouter.get("/owner", protect, getOwnerBookings);
bookingRouter.put("/change-status", protect, changeBookingStatus);

export default bookingRouter;
