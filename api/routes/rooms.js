import express from "express";
import { addRoom, updateRooms, updateRoomTypesByID, addRoomType, deleteRoom, deleteRoomType, getImagesFilenames, searchImages, updateRoomsByID, updateRoomTypes } from "../controllers/accomodations.js";

const router = express.Router()

router.get("/", updateRooms);
router.get("/room_types", updateRoomTypes);
router.get("/room_type_ByID:roomTypeID", updateRoomTypesByID);
router.get("/by_roomID:roomID", updateRoomsByID);
router.delete("/delete:roomID", deleteRoom);
router.delete("/delete_room_type:roomID", deleteRoomType);
router.post("/add_room", addRoom);
router.post("/add_room_type", addRoomType);
router.get("/get_filenames", getImagesFilenames)
router.get("/get_images", searchImages)

export default router