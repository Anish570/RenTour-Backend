import { readProductsFile, writeProductsFile } from "../utils/readJsonFile.js";

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
      publisher: userId, // ✅ Set publisher = logged in user's ID
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

// // 📌 GET All
// export const getAllProducts = (req, res) => {
//   const products = readProductsFile();
//   res.json(products);
// };

// // 📌 GET One
// export const getProductById = (req, res) => {
//   const products = readProductsFile();
//   const product = products.find((p) => p.id === Number(req.params.id));
//   if (!product) return res.status(404).json({ error: "Product not found" });
//   res.json(product);
// };

// // 📌 UPDATE Product
// export const updateProduct = (req, res) => {
//   const products = readProducts();
//   const index = products.findIndex((p) => p.id === Number(req.params.id));
//   if (index === -1) return res.status(404).json({ error: "Product not found" });

//   const existing = products[index];
//   const newImages = req.files.map(
//     (file) =>
//       `/images/${req.body.category || existing.category}/${file.filename}`
//   );

//   const updated = {
//     ...existing,
//     ...req.body,
//     productAvatar: newImages[0] || existing.productAvatar,
//     images: newImages.length > 0 ? newImages : existing.images,
//     features: req.body.features?.split(",") || existing.features,
//   };

//   products[index] = updated;
//   writeProducts(products);
//   res.json({ message: "Product updated", product: updated });
// };

// // 📌 DELETE Product
// export const deleteProduct = (req, res) => {
//   const products = readProducts();
//   const index = products.findIndex((p) => p.id === Number(req.params.id));
//   if (index === -1) return res.status(404).json({ error: "Product not found" });

//   const deleted = products.splice(index, 1)[0];

//   // delete files from server
//   deleted.images.forEach((img) => {
//     const filePath = path.join("public", img);
//     if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//   });

//   writeProducts(products);
//   res.json({ message: "Product deleted", product: deleted });
// };
