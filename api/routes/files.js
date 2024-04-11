import express from "express";
import { retrieveImages, geImageByID } from "../controllers/images.js";

const router = express.Router()

router.get("/retrieve_images", retrieveImages)
router.get("/get_image_by_id:imageID", geImageByID)

export default router