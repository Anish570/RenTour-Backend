import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createProduct,
  deleteMyProduct,
  getMyProducts,
  updateMyProduct,
} from "../controllers/sellerController.js";
import upload from "../middleware/uploadMiddleware.js";
const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  upload.fields([
    { name: "productAvatar", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  createProduct
);

router.get("/my-products", authMiddleware, getMyProducts);
router.delete("/:id", authMiddleware, deleteMyProduct);
router.put(
  "/:id",
  authMiddleware,
  upload.fields([
    { name: "productAvatar", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  updateMyProduct
);
export default router;
