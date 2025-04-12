import express from "express";
import {
  getProductById,
  getProductsByCategory,
  newArrivals,
  topSold,
} from "../controllers/productController.js";
const router = express.Router();

router.get("/new-arrivals", newArrivals);
router.get("/top-sold", topSold);
router.get("/category/:category", getProductsByCategory);
router.get("/:id", getProductById);

export default router;
