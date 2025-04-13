const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes"); // Adjust path if needed

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigin = "https://new-rentour.vercel.app";

app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Session Configuration
app.use(
  session({
    secret: "yourSecretKey", // Change this in production
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // true if using HTTPS (you are)
      sameSite: "none", // Needed for cross-site cookies
      httpOnly: true, // Protects from XSS
    },
  })
);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// User routes
app.use("/api/user", userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
