import express from "express";
import { logout, register, login, getUserID, getEmail, getUserByID } from "../controllers/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/getUserID:email", getUserID);
router.get("/getEmail:userID", getEmail);
router.get("/getUserbyID:userID", getUserByID);

export default router;