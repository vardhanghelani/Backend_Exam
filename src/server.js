const dotenv = require('dotenv');
const connectDB = require('./config/db');
const app = require('./app');
const Role = require('./models/Role');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Seeding Logic
const seedData = async () => {
    try {
        // Seed Roles
        const roles = ['MANAGER', 'SUPPORT', 'USER'];
        for (const roleName of roles) {
            const roleExists = await Role.findOne({ name: roleName });
            if (!roleExists) {
                await Role.create({ name: roleName });
                console.log(`Role ${roleName} created`);
            }
        }

        // Seed Default Manager
        const managerRole = await Role.findOne({ name: 'MANAGER' });
        const adminExists = await User.findOne({ email: 'admin@company.com' });
        if (!adminExists) {
            await User.create({
                name: 'Default Admin',
                email: 'admin@company.com',
                password: 'Admin@123',
                role: managerRole._id
            });
            console.log('Default Manager user created (admin@company.com / Admin@123)');
        }
    } catch (error) {
        console.error(`Seeding error: ${error.message}`);
    }
};

// Start Server
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await seedData();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});
