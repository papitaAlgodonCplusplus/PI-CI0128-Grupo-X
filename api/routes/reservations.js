import express from "express";
import { getReservations, addReservation, getReservationByRoomID, getReservationsByUserID, deleteReservation, getReservationByID, updateReservation } from "../controllers/reservation.js";

const router = express.Router()

router.get("/", getReservations);
router.get("/by_userID:userID", getReservationsByUserID);
router.post("/add_reservation", addReservation);
router.get("/get_reservations_by_room_id:roomID", getReservationByRoomID);
router.get("/get_reservation_by_id:reservationID", getReservationByID);
router.delete("/delete:reservationID", deleteReservation);
router.put("/updateReservation", updateReservation)
export default router;