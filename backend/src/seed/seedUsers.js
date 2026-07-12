require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");

const users = [
    {
        name: "System Admin",
        email: "admin@transitops.com",
        password: "Admin@123",
        role: "Admin"
    },
    {
        name: "Alex Fleet",
        email: "fleet@transitops.com",
        password: "Fleet@123",
        role: "Fleet Manager"
    },
    {
        name: "Sam Driver",
        email: "driver@transitops.com",
        password: "Driver@123",
        role: "Driver"
    },
    {
        name: "Sarah Safety",
        email: "safety@transitops.com",
        password: "Safety@123",
        role: "Safety Officer"
    },
    {
        name: "Frank Finance",
        email: "finance@transitops.com",
        password: "Finance@123",
        role: "Financial Analyst"
    }
];

const seed = async () => {
    await connectDB();

    for (const userData of users) {
        const exists = await User.findOne({ email: userData.email });
        if (!exists) {
            await User.create(userData);
            console.log(`Created: ${userData.role} — ${userData.email}`);
        } else {
            console.log(`Already exists: ${userData.email}`);
        }
    }

    console.log("\nSeed complete. Login credentials:");
    users.forEach(u => console.log(`  [${u.role}] ${u.email} / ${u.password}`));

    process.exit(0);
};

seed();
