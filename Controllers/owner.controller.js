import Car from "../Models/car.model.js";
import User from "../Models/User.model.js";
import fs from "fs";
import imagekit from "../config/imagekit.js";
import Booking from "../Models/Booking.model.js";

//  Add Car
export const addCar = async (req, res) => {
  try {
    const { _id } = req.user;
    const car = JSON.parse(req.body.carData);
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ success: false, message: "Image file is required" });
    }

    const fileBuffer = fs.readFileSync(imageFile.path);
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/cars",
    });

    const optimizedImageURL = imagekit.url({
      path: response.filePath,
      transformation: [
        { width: 1280 },
        { quality: "auto" },
        { format: "webp" },
      ]
    });

    fs.unlinkSync(imageFile.path);

    await Car.create({ ...car, owner: _id, image: optimizedImageURL });

    res.status(200).json({ success: true, message: "Car added successfully" });
  } catch (error) {
    console.error("AddCar Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

//  List Cars for Owner
export const listCars = async (req, res) => {
  try {
    const { _id } = req.user;
    const cars = await Car.find({ owner: _id });
    res.status(200).json({ success: true, cars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Get Owner Cars
export const getOwnerCars = async (req, res) => {
  try {
    const { _id } = req.user;
    const cars = await Car.find({ owner: _id });
    res.status(200).json({ success: true, cars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Toggle Car Availability
export const toggleCarAvailability = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;

    const car = await Car.findById(carId);
    if (!car || car.owner.toString() !== _id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    car.isAvailable = !car.isAvailable;
    await car.save();

    res.status(200).json({ success: true, message: "Car availability toggled" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Delete Car 
export const deleteCar = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;

    const car = await Car.findById(carId);
    if (!car || car.owner.toString() !== _id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    car.owner = null;
    car.isAvailable = false;
    await car.save();

    res.status(200).json({ success: true, message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Dashboard Stats
export const getDashboardData = async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (role !== "owner") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const cars = await Car.find({ owner: _id });
    const bookings = await Booking.find({ owner: _id }).populate("car").sort({ createdAt: -1 });

    const pendingBookings = bookings.filter(b => b.status === "pending");
    const completedBookings = bookings.filter(b => b.status === "confirmed");

    const monthlyRevenue = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    res.status(200).json({
      success: true,
      dashboardData: {
        totalCars: cars.length,
        totalBookings: bookings.length,
        pendingBookings: pendingBookings.length,
        completedBookings: completedBookings.length,
        recentBooking: bookings.slice(0, 3),
        monthlyRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Profile Image
export const updateUserImage = async (req, res) => {
  try {
    const { _id } = req.user;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ success: false, message: "Image file is required" });
    }

    const fileBuffer = fs.readFileSync(imageFile.path);
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/user",
    });

    const optimizedImageURL = imagekit.url({
      path: response.filePath,
      transformation: [
        { width: 400 },
        { quality: "auto" },
        { format: "webp" },
      ],
    });

    fs.unlinkSync(imageFile.path);

    await User.findByIdAndUpdate(_id, { image: optimizedImageURL });

    res.status(200).json({ success: true, message: "User profile updated successfully", image: optimizedImageURL });
  } catch (error) {
    console.error("Update image error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


