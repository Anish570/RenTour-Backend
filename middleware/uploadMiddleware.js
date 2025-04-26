import multer from "multer";
import path from "path";
import fs from "fs";

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const category = req.body.category || "Misc";
    const dir = `public/images/${category}`;

    fs.mkdirSync(dir, { recursive: true }); // Ensure directory exists
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique file name
  },
});

const upload = multer({ storage });

export default upload;
