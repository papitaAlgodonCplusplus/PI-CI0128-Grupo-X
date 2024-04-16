import express from "express";
import { addService, updateServices, deleteService, getService, addToServiceLog, getSumByReservationID} from "../controllers/amenity.js";

const router = express.Router()

router.get("/", updateServices);
router.get("/get_service:serviceName", getService);
router.delete("/delete:serviceID", deleteService);
router.post("/add_service", addService);
router.post("/add_to_service_log", addToServiceLog)
router.get("/get_sum:reservationID", getSumByReservationID);
export default router