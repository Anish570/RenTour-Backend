import { readProductsFile } from "../utils/readJsonFile.js";

export const getProductById = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const products = await readProductsFile();
    const foundProduct = products.find((p) => p.id === id);

    if (!foundProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json(foundProduct);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const newArrivals = async (req, res) => {
  try {
    const products = await readProductsFile();

    const sorted = products
      .filter((p) => p.createdAt) // Optional: Ensure date exists
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Newest first
      .slice(0, 4); // Limit to latest 5 products

    res.json(sorted);
  } catch (err) {
    console.error("Error getting new arrivals:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const topSold = async (req, res) => {
  try {
    const products = await readProductsFile();
    const topProducts = products
      .filter((p) => typeof p.sold === "number")
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    return res.json(topProducts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  const { sort = "date_desc", page = 1, limit = 6 } = req.query;

  try {
    const allProducts = await readProductsFile();

    let filtered = allProducts.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );

    // Sorting
    const [key, direction] = sort.split("_");
    filtered.sort((a, b) => {
      const aVal = key === "date" ? new Date(a.createdAt) : a[key];
      const bVal = key === "date" ? new Date(b.createdAt) : b[key];
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    });

    // Pagination
    const start = (page - 1) * limit;
    const end = start + Number(limit);
    const paginated = filtered.slice(start, end);

    res.json({
      products: paginated,
      total: filtered.length,
      currentPage: Number(page),
      totalPages: Math.ceil(filtered.length / limit),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const products = await readProductsFile();
    const query = req.query.q?.toLowerCase();

    if (!query) {
      return res.status(400).json({ message: "Search query missing" });
    }

    // Case-insensitive name match
    const filtered = products.filter(
      (p) =>
        p.name?.toLowerCase().includes(query.toLowerCase()) ||
        p.category?.toLowerCase().includes(query.toLowerCase()) ||
        p.publisher_name?.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase()) ||
        p.features?.some((feature) =>
          feature.toLowerCase().includes(query.toLowerCase())
        )
    );
    res.status(200).json(filtered);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error during search" });
  }
};
