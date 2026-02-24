const Ticket = require('../models/Ticket');
const TicketStatusLog = require('../models/TicketStatusLog');
const User = require('../models/User');
const Role = require('../models/Role');

exports.mkTkt = async (q, s, n) => {
    try {
        const { title, description, priority } = q.body;
        const t = await Ticket.create({
            title,
            description,
            priority,
            created_by: q.user._id
        });
        s.status(201).json({ ok: true, data: t });
    } catch (err) {
        n(err);
    }
};

exports.getTkts = async (q, s, n) => {
    try {
        let filt = {};

        if (q.user.role.name === 'SUPPORT') {
            filt.assigned_to = q.user._id;
        } else if (q.user.role.name === 'USER') {
            filt.created_by = q.user._id;
        }

        const list = await Ticket.find(filt).populate('created_by assigned_to');
        s.status(200).json({ ok: true, count: list.length, data: list });
    } catch (err) {
        n(err);
    }
};

exports.setAssigned = async (q, s, n) => {
    try {
        const { assigned_to } = q.body;
        const u = await User.findById(assigned_to).populate('role');

        if (!u || u.role.name === 'USER') {
            return s.status(400).json({ ok: false, msg: 'cant assign to normal user' });
        }

        const t = await Ticket.findByIdAndUpdate(
            q.params.id,
            { assigned_to },
            { new: true, runValidators: true }
        );

        if (!t) {
            return s.status(404).json({ ok: false, msg: 'no ticket found' });
        }

        s.status(200).json({ ok: true, data: t });
    } catch (err) {
        n(err);
    }
};

exports.updStat = async (q, s, n) => {
    try {
        const { status: nextS } = q.body;
        const t = await Ticket.findById(q.params.id);

        if (!t) {
            return s.status(404).json({ ok: false, msg: 'no ticket' });
        }

        if (q.user.role.name === 'SUPPORT' && t.assigned_to?.toString() !== q.user._id.toString()) {
            return s.status(403).json({ ok: false, msg: 'not yours' });
        }

        if (q.user.role.name === 'USER') {
            return s.status(403).json({ ok: false, msg: 'no permission' });
        }

        const canGo = {
            'OPEN': ['IN_PROGRESS'],
            'IN_PROGRESS': ['RESOLVED'],
            'RESOLVED': ['CLOSED']
        };

        if (!canGo[t.status] || !canGo[t.status].includes(nextS)) {
            return s.status(400).json({
                ok: false,
                msg: `cant go from ${t.status} to ${nextS}`
            });
        }

        const oldS = t.status;
        t.status = nextS;
        await t.save();

        await TicketStatusLog.create({
            ticket: t._id,
            old_status: oldS,
            new_status: nextS,
            changed_by: q.user._id
        });

        s.status(200).json({ ok: true, data: t });
    } catch (err) {
        n(err);
    }
};

exports.killTkt = async (q, s, n) => {
    try {
        const t = await Ticket.findById(q.params.id);
        if (!t) {
            return s.status(404).json({ ok: false, msg: 'no ticket' });
        }

        await require('../models/TicketComment').deleteMany({ ticket: t._id });
        await require('../models/TicketStatusLog').deleteMany({ ticket: t._id });

        await t.deleteOne();

        s.status(200).json({ ok: true, data: {} });
    } catch (err) {
        n(err);
    }
};
