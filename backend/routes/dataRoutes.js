import express from "express";
import { getCategories, getSubcategories, getPaymentMethods } from "../controllers/dataController.js";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/subcategories", getSubcategories);
router.get("/payment-methods", getPaymentMethods);

export default router;
