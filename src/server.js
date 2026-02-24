const dotenv = require('dotenv');
const db = require('./config/db');
const app = require('./app');
const Role = require('./models/Role');
const User = require('./models/User');

dotenv.config();

db();

const init = async () => {
    try {
        const roles = ['MANAGER', 'SUPPORT', 'USER'];
        for (const r of roles) {
            const has = await Role.findOne({ name: r });
            if (!has) {
                await Role.create({ name: r });
                console.log(`new role: ${r}`);
            }
        }

        const rm = await Role.findOne({ name: 'MANAGER' });
        const admin = await User.findOne({ email: 'admin@company.com' });
        if (!admin) {
            await User.create({
                name: 'Boss User',
                email: 'admin@company.com',
                password: 'Admin@123',
                role: rm._id
            });
            console.log('admin set');
        }
    } catch (err) {
        console.error(`init err: ${err.message}`);
    }
};

const port = process.env.PORT || 3000;

const srv = app.listen(port, async () => {
    console.log(`runnin on ${port}`);
    await init();
});

process.on('unhandledRejection', (err, p) => {
    console.log(`oh no: ${err.message}`);
    srv.close(() => process.exit(1));
});
