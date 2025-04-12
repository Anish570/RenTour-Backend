import jwt from "jsonwebtoken";

const JWT_SECRET = "Secrectkey";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization token missing or malformed" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // contains { id, username, type }
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
