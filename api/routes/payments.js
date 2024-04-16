import express from "express";
import { addCardPayment, addPayment, addBankPayment, addCashPayment, getPaymentByID } from "../controllers/payment.js";

const router = express.Router()

router.post("/add_card_payment", addCardPayment)
router.post("/add_bank_payment", addBankPayment)
router.post("/add_cash_payment", addCashPayment)
router.post("/add_payment", addPayment)
router.get("/payment_byPaymentID:paymentID", getPaymentByID)
export default router