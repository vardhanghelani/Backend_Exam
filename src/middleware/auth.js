const jwt = require('jsonwebtoken');
const User = require('../models/User');

const checkAuth = async (q, s, n) => {
    let t;

    if (
        q.headers.authorization &&
        q.headers.authorization.startsWith('Bearer')
    ) {
        try {
            t = q.headers.authorization.split(' ')[1];
            const d = jwt.verify(t, process.env.JWT_SECRET);
            q.user = await User.findById(d.id).populate('role');
            n();
        } catch (err) {
            return s.status(401).json({ ok: false, msg: 'login first' });
        }
    }

    if (!t) {
        return s.status(401).json({ ok: false, msg: 'no token' });
    }
};

module.exports = { checkAuth };
