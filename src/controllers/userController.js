const User = require('../models/User');
const Role = require('../models/Role');

exports.getUsers = async (q, s, n) => {
    try {
        const list = await User.find().populate('role');
        s.status(200).json({ ok: true, count: list.length, data: list });
    } catch (err) {
        n(err);
    }
};

exports.mkUser = async (q, s, n) => {
    try {
        const { name, email, password, roleName } = q.body;

        const foundR = await Role.findOne({ name: roleName });
        if (!foundR) {
            return s.status(400).json({ ok: false, msg: 'role not found' });
        }

        const u = await User.create({
            name,
            email,
            password,
            role: foundR._id
        });

        s.status(201).json({ ok: true, data: u });
    } catch (err) {
        n(err);
    }
};
