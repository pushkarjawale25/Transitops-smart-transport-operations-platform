const mongoose = require("mongoose");

let mongoServer;

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI || "mongodb+srv://pushkar:Pushkar2005@cluster0.duv1kem.mongodb.net/strideX?appName=Cluster0";

        try {
            console.log(`Connecting to MongoDB at ${uri}...`);
            await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
            console.log("MongoDB Connected to external server");
        } catch (connectionErr) {
            console.log("External MongoDB server not running. Starting in-memory MongoDB server...");
            const { MongoMemoryServer } = require("mongodb-memory-server");
            mongoServer = await MongoMemoryServer.create();
            uri = mongoServer.getUri();
            console.log(`In-memory MongoDB started at: ${uri}`);
            await mongoose.connect(uri);
            console.log("MongoDB Connected (In-Memory)");
        }
    } catch (err) {
        console.error("Failed to connect to database:", err);
        process.exit(1);
    }
};

module.exports = connectDB;