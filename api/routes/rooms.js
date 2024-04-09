import express from "express";
import { addRoom, updateRooms, searchRooms, deleteRoom, updateImages, searchImages } from "../controllers/room.js";

const router = express.Router()

router.get("/", updateRooms);
router.delete("/delete:roomId", deleteRoom);
router.get("/search:term", searchRooms);
router.post("/add_room", addRoom);
router.get("/get_images_names", updateImages)
router.get("/get_images", searchImages)

export default router