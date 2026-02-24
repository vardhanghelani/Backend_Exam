const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ ok: false, msg: 'need email and pass' });
        }

        const u = await User.findOne({ email }).select('+password').populate('role');

        if (!u || !(await u.checkPass(password))) {
            return res.status(401).json({ ok: false, msg: 'wrong creds' });
        }

        const t = jwt.sign({ id: u._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        });

        res.status(200).json({
            ok: true,
            token: t,
            user: {
                id: u._id,
                name: u.name,
                email: u.email,
                role: u.role.name
            }
        });
    } catch (err) {
        next(err);
    }
};
