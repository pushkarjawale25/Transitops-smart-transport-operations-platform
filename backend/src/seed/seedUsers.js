require("dotenv").config();
const connectDB = require("../config/db");
const seedAll = require("./autoSeed");

const seed = async () => {
    await connectDB();
    await seedAll();
    process.exit(0);
};

seed();
