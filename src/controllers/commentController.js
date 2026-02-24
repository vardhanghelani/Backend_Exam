const TicketComment = require('../models/TicketComment');

exports.mkComm = async (q, s, n) => {
    try {
        const Ticket = require('../models/Ticket');
        const t = await Ticket.findById(q.params.id);

        if (!t) {
            return s.status(404).json({ ok: false, msg: 'no ticket' });
        }

        const isMgr = q.user.role.name === 'MANAGER';
        const isSup = q.user.role.name === 'SUPPORT' && t.assigned_to?.toString() === q.user._id.toString();
        const isOwn = q.user.role.name === 'USER' && t.created_by.toString() === q.user._id.toString();

        if (!isMgr && !isSup && !isOwn) {
            return s.status(403).json({ ok: false, msg: 'no permission for this' });
        }

        const c = await TicketComment.create({
            ticket: q.params.id,
            user: q.user._id,
            comment: q.body.comment
        });
        s.status(201).json({ ok: true, data: c });
    } catch (err) {
        n(err);
    }
};

exports.getComms = async (q, s, n) => {
    try {
        const Ticket = require('../models/Ticket');
        const t = await Ticket.findById(q.params.id);

        if (!t) {
            return s.status(404).json({ ok: false, msg: 'no ticket' });
        }

        const isMgr = q.user.role.name === 'MANAGER';
        const isSup = q.user.role.name === 'SUPPORT' && t.assigned_to?.toString() === q.user._id.toString();
        const isOwn = q.user.role.name === 'USER' && t.created_by.toString() === q.user._id.toString();

        if (!isMgr && !isSup && !isOwn) {
            return s.status(403).json({ ok: false, msg: 'cant see this' });
        }

        const list = await TicketComment.find({ ticket: q.params.id }).populate('user');
        s.status(200).json({ ok: true, count: list.length, data: list });
    } catch (err) {
        n(err);
    }
};

exports.editComm = async (q, s, n) => {
    try {
        let c = await TicketComment.findById(q.params.id);
        if (!c) {
            return s.status(404).json({ ok: false, msg: 'no comment' });
        }

        if (c.user.toString() !== q.user._id.toString() && q.user.role.name !== 'MANAGER') {
            return s.status(403).json({ ok: false, msg: 'forbidden' });
        }

        c = await TicketComment.findByIdAndUpdate(q.params.id, q.body, {
            new: true,
            runValidators: true
        });

        s.status(200).json({ ok: true, data: c });
    } catch (err) {
        n(err);
    }
};

exports.killComm = async (q, s, n) => {
    try {
        const c = await TicketComment.findById(q.params.id);
        if (!c) {
            return s.status(404).json({ ok: false, msg: 'no comment' });
        }

        if (c.user.toString() !== q.user._id.toString() && q.user.role.name !== 'MANAGER') {
            return s.status(403).json({ ok: false, msg: 'no auth' });
        }

        await c.deleteOne();
        s.status(200).json({ ok: true, data: {} });
    } catch (err) {
        n(err);
    }
};
