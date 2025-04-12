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
