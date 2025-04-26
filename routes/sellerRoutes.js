import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createProduct,
  // deleteProduct,
  // getAllProducts,
  // getProductById,
  // updateProduct,
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
// router.get("/", getAllProducts);
// router.get("/:id", getProductById);
// router.put("/:id", authMiddleware, upload.array("images", 5), updateProduct);
// router.delete("/:id", authMiddleware, deleteProduct);

export default router;


