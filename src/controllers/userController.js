const User = require('../models/User');
const Role = require('../models/Role');

// @desc    Get all users
// @route   GET /users
// @access  Private/Manager
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find().populate('role');
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        next(error);
    }
};

// @desc    Create user
// @route   POST /users
// @access  Private/Manager
exports.createUser = async (req, res, next) => {
    try {
        const { name, email, password, roleName } = req.body;

        const role = await Role.findOne({ name: roleName });
        if (!role) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role._id
        });

        res.status(201).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};
