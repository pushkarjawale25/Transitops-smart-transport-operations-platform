const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const app = express();

// ─── Core Middleware ────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS Configuration ──────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(cookieParser());
app.use(morgan("dev"));

// ─── Health Check Route ──────────────────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "TransitOps API Running"
    });
});

// ─── Routes ─────────────────────────────────────────────────────────────────
const testRoute = require("./routes/test");
app.use("/api/test", testRoute);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);

// ─── Global Error Handler (must be LAST) ────────────────────────────────────
const { errorHandler } = require("./middleware/errorMiddleware");
app.use(errorHandler);

module.exports = app;