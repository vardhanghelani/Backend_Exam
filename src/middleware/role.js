const checkRole = (...roles) => {
    return (q, s, n) => {
        if (!q.user || !roles.includes(q.user.role.name)) {
            return s.status(403).json({
                ok: false,
                msg: `ur role ${q.user.role.name} cant do this`
            });
        }
        n();
    };
};

module.exports = { checkRole };
