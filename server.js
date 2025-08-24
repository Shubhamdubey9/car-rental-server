import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRouter from "./Routes/User.routes.js";
import ownerRouter from "./Routes/ownerRoutes.js";
import bookingRouter from "./Routes/booking.routes.js";
import cookieParser from "cookie-parser";



dotenv.config();
connectDB();
const app = express();


const corsOption = {
  origin:  "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOption));
app.use(express.json());


app.use(cookieParser()); 
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});



// routes
app.get("/", (req, res) => res.send("Api Is Woring here Now"));

app.use("/api/user", userRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/booking", bookingRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
});


