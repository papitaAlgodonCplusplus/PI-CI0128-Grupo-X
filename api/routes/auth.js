import express from "express";
import { logout, register, login, getUserID, getEmail } from "../controllers/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/getUserID:email", getUserID);
router.get("/getEmail:userID", getEmail);

export default router;