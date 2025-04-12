import express from "express";
import {
  getCart,
  getWishlist,
  updateCart,
  updateWishlist,
} from "../controllers/cartController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// In authRoutes.js or new cartRoutes.js
router.post("/update-cart", authMiddleware, updateCart);

router.post("/update-wishlist", authMiddleware, updateWishlist);

router.get("/get-cart", authMiddleware, getCart);

router.get("/get-wishlist", authMiddleware, getWishlist);

export default router;
