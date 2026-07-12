const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(cookieParser());
app.use(morgan("dev"));


app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "TransitOps API Running"
    });
});

const testRoute = require("./routes/test");
app.use("/api/test", testRoute);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);


const { errorHandler } = require("./middleware/errorMiddleware");
app.use(errorHandler);

module.exports = app;