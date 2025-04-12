import fs from "fs";
import path from "path";
import process from "process";

const usersFile = path.join(process.cwd(), "src", "Data", "users.json");

const readUsers = () => {
  if (!fs.existsSync(usersFile)) return [];
  const data = fs.readFileSync(usersFile, "utf-8").trim();
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to parse users.json:", err.message);
    return [];
  }
};

const writeUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

// GET /api/user/get-cart
export const getCart = (req, res) => {
  try {
    const { id } = req.user; // user is injected by authMiddleware
    const users = readUsers();

    const user = users.find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ cart: user.cart || [] });
  } catch (err) {
    console.error("Error in getCart:", err);
    res.status(500).json({ message: "Server error retrieving cart" });
  }
};

//api/user/update-cart
export const updateCart = (req, res) => {
  const userId = req.user.id;
  const { cart } = req.body;

  if (!Array.isArray(cart)) {
    return res.status(400).json({ message: "Invalid cart data" });
  }

  try {
    const users = readUsers();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingCart = users[userIndex].cart || [];
    const updatedCartMap = new Map();

    // Step 1: Add existing items to map with their quantity and offeredPrice
    existingCart.forEach(({ productid, quantity, offeredPrice }) => {
      if (productid && quantity >= 0) {
        updatedCartMap.set(productid, { quantity, offeredPrice });
      }
    });

    // Step 2: Merge new cart items into map (update or insert)
    cart.forEach(({ productid, quantity, offeredPrice }) => {
      if (!productid || typeof quantity !== "number" || quantity < 0) return;

      const existing = updatedCartMap.get(productid) || {};
      updatedCartMap.set(productid, {
        quantity,
        offeredPrice: offeredPrice ?? existing.offeredPrice,
      });
    });

    // Step 3: Convert map to array format [{ productid, quantity, offeredPrice }]
    // and remove items with quantity === 0
    const mergedCart = Array.from(updatedCartMap.entries())
      .filter(([_, item]) => item.quantity > 0)
      .map(([productid, { quantity, offeredPrice }]) => ({
        productid,
        quantity,
        offeredPrice,
      }));

    users[userIndex].cart = mergedCart;
    writeUsers(users);

    res
      .status(200)
      .json({ message: "Cart updated successfully", cart: mergedCart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET /api/user/get-wishlist
export const getWishlist = (req, res) => {
  try {
    const { id } = req.user;
    const users = readUsers();

    const user = users.find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure wishlist is always an array
    const wishlist = Array.isArray(user.wishlist) ? user.wishlist : [];

    res.status(200).json({ wishlist });
  } catch (err) {
    console.error("Error in getWishlist:", err);
    res.status(500).json({ message: "Server error retrieving wishlist" });
  }
};

export const updateWishlist = (req, res) => {
  const userId = req.user.id;
  const users = readUsers();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  const { wishlist } = req.body;

  if (!Array.isArray(wishlist)) {
    return res.status(400).json({ message: "Invalid wishlist format" });
  }

  // Validate each item is an object with a productId
  const isValidFormat = wishlist.every(
    (item) => typeof item === "object" && item !== null && "productId" in item
  );

  if (!isValidFormat) {
    return res.status(400).json({
      message: "Each wishlist item must be an object with a 'productId' field",
    });
  }

  users[userIndex].wishlist = wishlist;
  writeUsers(users);

  return res.status(200).json({
    message: "Wishlist updated successfully",
    wishlist,
  });
};
