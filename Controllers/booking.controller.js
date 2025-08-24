import Booking from "../Models/Booking.model.js";
import Car from "../Models/car.model.js";

export const checkAvailability = async (car, pickupDate, returnDate) => {
  const start = new Date(pickupDate);
  const end = new Date(returnDate);

  
  const bookings = await Booking.find({
    car: car._id,
    $or: [
      { pickupDate: { $lte: end }, 
      returnDate: { $gte: start } }, // overlapping condition
    ],
  });

  return bookings.length === 0; // ✅ true means available
};


export const checkAvailabilityOfCar = async (req, res) => {
  try {
    const { pickupDate, returnDate, location } = req.body;

    if (!pickupDate || !returnDate) {
      return res
        .status(400)
        .json({ success: false, message: "Pickup and return dates required" });
    }

    let query = { isAvailable: true };
    if (location) query.location = location; // optional filter

    const cars = await Car.find(query);

    
    const availableCarsPromises = cars.map(async (car) => {
      const isAvailable = await checkAvailability(car, pickupDate, returnDate);
      return { ...car._doc, isAvailable };
    });

    let availableCars = await Promise.all(availableCarsPromises);

    
    availableCars = availableCars.filter((car) => car.isAvailable);

    res.status(200).json({ success: true, availableCars });
  } catch (error) {
    console.error("checkAvailabilityOfCar Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//  API: Create a booking
export const createBooking = async (req, res) => {
  try {
    const { carId, pickupDate, returnDate } = req.body;
    const userId = req.user._id;

    if (!carId || !pickupDate || !returnDate) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const car = await Car.findById(carId);
    if (!car)
      return res.status(404).json({ success: false, message: "Car not found" });

    // Check availability
    const isAvailable = await checkAvailability(car, pickupDate, returnDate);
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Car is not available for selected dates",
      });
    }

    
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const noOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
    const totalPrice = noOfDays * car.pricePerDay;

    // Create booking
    const booking = await Booking.create({
      car: carId,
      owner: car.owner,
      user: userId,
      pickupDate,
      returnDate,
      price: totalPrice,
      status: "pending", // default
    });

    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error("createBooking Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API Get bookings of logged-in user
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ user: userId })
      .populate("car owner")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("getUserBookings Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API: Get bookings of logged-in owner
export const getOwnerBookings = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const ownerId = req.user._id;

    const bookings = await Booking.find({ owner: ownerId })
      .populate("car user")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("getOwnerBookings Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API: Change booking status (owner only)
export const changeBookingStatus = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { bookingId, status } = req.body;

    const booking = await Booking.findById(bookingId).populate("owner");
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    if (booking.owner.toString() !== ownerId.toString()) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error("changeBookingStatus Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
