const Ticket = require('../models/Ticket');
const TicketStatusLog = require('../models/TicketStatusLog');
const User = require('../models/User');
const Role = require('../models/Role');

// @desc    Create ticket
// @route   POST /tickets
// @access  Private (USER, MANAGER)
exports.createTicket = async (req, res, next) => {
    try {
        const { title, description, priority } = req.body;
        const ticket = await Ticket.create({
            title,
            description,
            priority,
            created_by: req.user._id
        });
        res.status(201).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all tickets
// @route   GET /tickets
// @access  Private
exports.getTickets = async (req, res, next) => {
    try {
        let query = {};

        if (req.user.role.name === 'SUPPORT') {
            query.assigned_to = req.user._id;
        } else if (req.user.role.name === 'USER') {
            query.created_by = req.user._id;
        }
        // MANAGER gets all, so query remains empty {}

        const tickets = await Ticket.find(query).populate('created_by assigned_to');
        res.status(200).json({ success: true, count: tickets.length, data: tickets });
    } catch (error) {
        next(error);
    }
};

// @desc    Assign ticket
// @route   PATCH /tickets/:id/assign
// @access  Private (MANAGER, SUPPORT)
exports.assignTicket = async (req, res, next) => {
    try {
        const { assigned_to } = req.body;
        const user = await User.findById(assigned_to).populate('role');

        if (!user || user.role.name === 'USER') {
            return res.status(400).json({ success: false, message: 'Cannot assign ticket to USER role' });
        }

        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { assigned_to },
            { new: true, runValidators: true }
        );

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};

// @desc    Update ticket status
// @route   PATCH /tickets/:id/status
// @access  Private (MANAGER, SUPPORT)
exports.updateTicketStatus = async (req, res, next) => {
    try {
        const { status: new_status } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        // Check permissions: MANAGER always, SUPPORT if assigned
        if (req.user.role.name === 'SUPPORT' && ticket.assigned_to?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update status of unassigned ticket' });
        }

        if (req.user.role.name === 'USER') {
            return res.status(403).json({ success: false, message: 'USER role not authorized to update status' });
        }

        const allowedTransitions = {
            'OPEN': ['IN_PROGRESS'],
            'IN_PROGRESS': ['RESOLVED'],
            'RESOLVED': ['CLOSED']
        };

        if (!allowedTransitions[ticket.status] || !allowedTransitions[ticket.status].includes(new_status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status transition from ${ticket.status} to ${new_status}`
            });
        }

        const old_status = ticket.status;
        ticket.status = new_status;
        await ticket.save();

        await TicketStatusLog.create({
            ticket: ticket._id,
            old_status,
            new_status,
            changed_by: req.user._id
        });

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete ticket
// @route   DELETE /tickets/:id
// @access  Private (MANAGER)
exports.deleteTicket = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        // Cascade delete comments and status logs
        await require('../models/TicketComment').deleteMany({ ticket: ticket._id });
        await require('../models/TicketStatusLog').deleteMany({ ticket: ticket._id });

        await ticket.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};
