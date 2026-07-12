exports.errorHandler = (err, req, res, next) => {
    if (process.env.NODE_ENV !== "production") {
        console.error("[ERROR]", err.stack || err);
    } else {
        console.error("[ERROR]", err.message);
    }

    const statusCode = err.statusCode || err.status || 500;
    const message = statusCode === 500 && process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message || "Internal Server Error";

    res.status(statusCode).json({ success: false, message });
};
