require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const seedAll = require('./seed/autoSeed');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    await seedAll();

    app.listen(PORT, () => {
        console.log(`Server Running on Port ${PORT}`);
    });
};

startServer();