const errorHandler = (err, q, s, n) => {
    let error = { ...err };
    error.message = err.message;

    console.error(err);

    if (err.name === 'CastError') {
        return s.status(404).json({ ok: false, msg: `not found: ${err.value}` });
    }

    if (err.code === 11000) {
        return s.status(400).json({ ok: false, msg: 'already there' });
    }

    if (err.name === 'ValidationError') {
        const msgs = Object.values(err.errors).map(v => v.message);
        return s.status(400).json({ ok: false, msg: msgs });
    }

    s.status(error.statusCode || 500).json({
        ok: false,
        msg: error.message || 'server messed up'
    });
};

module.exports = errorHandler;
