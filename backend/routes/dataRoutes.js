import express from "express";
import {
  getPaymentMethods,
  getSubCategoryByCategoryId,
  getCategories
} from "../controllers/dataController.js";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/subcategories/:id",getSubCategoryByCategoryId);
router.get("/payment-methods", getPaymentMethods);

export default router;


