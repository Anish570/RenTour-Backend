import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { readProductsFile, writeProductsFile } from "../utils/readJsonFile.js";

// Setup __dirname because we use ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📌 CREATE Product
export const createProduct = async (req, res) => {
  try {
    const products = await readProductsFile();
    const {
      name,
      category,
      description,
      stock,
      originalPrice,
      offeredPrice,
      features,
    } = req.body;

    const userId = req.user.id; // 🧠 user.id comes from authMiddleware
    const userName = req.user?.name || req.user?.username;
    // Get productAvatar and images
    const productAvatarFile = req.files?.productAvatar?.[0];
    const imagesFiles = req.files?.images || [];

    const productAvatar = productAvatarFile
      ? `/images/${category}/${productAvatarFile.filename}`
      : "";

    const images = imagesFiles.map(
      (file) => `/images/${category}/${file.filename}`
    );

    const newProduct = {
      id: Date.now(),
      name,
      category,
      publisher: userId,
      publisher_name: userName,
      description,
      stock: Number(stock),
      sold: 0,
      productAvatar,
      images,
      originalPrice: Number(originalPrice),
      offeredPrice: Number(offeredPrice),
      rating: 0,
      createdAt: new Date().toISOString().split("T")[0],
      reviews: [],
      features: features?.split(",") || [],
    };

    products.push(newProduct);
    await writeProductsFile(products);

    res.status(201).json({ message: "Product created", product: newProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Get all products listed by logged-in seller
export const getMyProducts = async (req, res) => {
  try {
    const products = await readProductsFile();
    const userId = req.user.id; // 🧠 From authMiddleware

    // Filter products that belong to this user
    const myProducts = products.filter(
      (product) => product.publisher === userId
    );

    res.status(200).json(myProducts);
  } catch (error) {
    console.error("Error fetching user's products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductDetail = async (req, res) => {
  try {
    const products = await readProductsFile();
    const userId = req.user.id;
    const productId = parseInt(req.params.id);

    const product = products.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.publisher !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this product" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Server error while fetching product details" });
  }
};
export const deleteMyProduct = async (req, res) => {
  try {
    const products = await readProductsFile();
    const userId = req.user.id;
    const productId = parseInt(req.params.id);

    // Find the product
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.publisher !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this product" });
    }

    // 🧹 Delete all associated images from filesystem
    const deleteImage = (relativePath) => {
      const fullPath = path.join(__dirname, "..", "public", relativePath);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (err) {
          console.error(`Failed to delete file: ${fullPath}`, err);
        }
      }
    };

    // 1. Delete all images inside `images[]`
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(deleteImage);
    }

    // 2. Delete productAvatar separately
    if (product.productAvatar) {
      deleteImage(product.productAvatar);
    }

    // Remove the product from the list
    const updatedProducts = products.filter((p) => p.id !== productId);

    // Save updated list
    await writeProductsFile(updatedProducts);

    res
      .status(200)
      .json({ message: "Product and all images deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Update a Product
export const updateMyProduct = async (req, res) => {
  try {
    const products = await readProductsFile();
    const userId = req.user.id;
    const productId = parseInt(req.params.id);

    const productIndex = products.findIndex((p) => p.id === productId);
    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = products[productIndex];

    if (product.publisher !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this product" });
    }

    // --- Helper: delete image file
    const deleteImage = (relativePath) => {
      const fullPath = path.join(
        __dirname,
        "..",
        "public",
        relativePath.replace(/^\/+/, "")
      );
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (err) {
          console.error(`Failed to delete file: ${fullPath}`, err);
        }
      }
    };

    // --- Step 1: First update text fields (category, name, etc.)
    const fieldsToUpdate = [
      "name",
      "category",
      "description",
      "stock",
      "originalPrice",
      "offeredPrice",
      "features",
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (["stock", "originalPrice", "offeredPrice"].includes(field)) {
          if (!isNaN(Number(req.body[field]))) {
            product[field] = Number(req.body[field]);
          }
        } else if (
          field === "features" &&
          typeof req.body.features === "string"
        ) {
          product.features = req.body.features.split(",").map((f) => f.trim());
        } else {
          product[field] = req.body[field];
        }
      }
    });

    const updatedCategory = product.category; // after potential update

    // --- Step 2: Handle Product Avatar
    const newProductAvatarFile = req.files?.["productAvatar"]?.[0];

    if (newProductAvatarFile) {
      // If new avatar uploaded, delete old avatar
      if (product.productAvatar) {
        deleteImage(product.productAvatar);
      }
      product.productAvatar = `/images/${updatedCategory}/${newProductAvatarFile.filename}`;
    }
    // else, keep old productAvatar (nothing to do)

    // --- Step 3: Handle multiple Images
    const newImagesFiles = req.files?.["images"] || [];

    if (req.body.existingImages || newImagesFiles.length > 0) {
      let existingImages = [];

      // Step 3.1: get existing images that are kept
      if (req.body.existingImages) {
        if (typeof req.body.existingImages === "string") {
          existingImages = [req.body.existingImages];
        } else if (Array.isArray(req.body.existingImages)) {
          existingImages = req.body.existingImages;
        }
      }

      // Step 3.2: delete old images that are removed
      const imagesToDelete = (product.images || []).filter(
        (imgPath) => !existingImages.includes(imgPath)
      );
      imagesToDelete.forEach(deleteImage);

      // Step 3.3: add newly uploaded images
      const newImagesPaths = newImagesFiles.map(
        (file) => `/images/${updatedCategory}/${file.filename}`
      );

      // Step 3.4: combine existing kept images and newly uploaded ones
      product.images = [...existingImages, ...newImagesPaths];
    }
    // else, keep old images (nothing to do)

    // --- Step 4: Save the updated product
    products[productIndex] = product;
    await writeProductsFile(products);

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error" });
  }
};
