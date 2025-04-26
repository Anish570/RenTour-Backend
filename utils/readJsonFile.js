import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to products.json
const filePath = path.join(__dirname, "../src/Data/products.json");

export const readProductsFile = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        return reject("Error reading products.json");
      }
      try {
        const products = JSON.parse(data);
        resolve(products);
      } catch (parseError) {
        reject("Error parsing products.json");
      }
    });
  });
};

// ✅ Write Products
export const writeProductsFile = (products) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing products.json", error);
    throw new Error("Error writing products.json");
  }
};
