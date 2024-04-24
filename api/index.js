import express from "express";
import roomsRoutes from "./routes/rooms.js"
import fileRoutes from "./routes/files.js"
import authRoutes from "./routes/auth.js"
import filterRoutes from "./routes/filters.js"
import reservationRoutes from "./routes/reservations.js"
import paymentRouter from "./routes/payments.js"
import serviceRouter from "./routes/amenities.js"
import path from "path";
import cookieParser from "cookie-parser";
import multer from "multer";
import http from 'http';

const app = express()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../client/public/upload/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post("/api/upload", upload.single("image"), function (req, res) {
  const file = req.file;
  res.status(200).json(file.filename);
});

app.use(express.json())
app.use(cookieParser())
app.use("/api/rooms", roomsRoutes)
app.use("/api/files", fileRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/filters", filterRoutes)
app.use("/api/reservations", reservationRoutes)
app.use("/api/payments", paymentRouter)
app.use("/api/services", serviceRouter)

app.listen(8800, () => {
  console.log("Connected")
})