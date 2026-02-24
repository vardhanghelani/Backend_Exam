const TicketComment = require('../models/TicketComment');

// @desc    Add comment to ticket
// @route   POST /tickets/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
    try {
        const Ticket = require('../models/Ticket');
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        // Check permissions: MANAGER; SUPPORT if assigned; USER if owner
        const isManager = req.user.role.name === 'MANAGER';
        const isAssignedSupport = req.user.role.name === 'SUPPORT' && ticket.assigned_to?.toString() === req.user._id.toString();
        const isOwner = req.user.role.name === 'USER' && ticket.created_by.toString() === req.user._id.toString();

        if (!isManager && !isAssignedSupport && !isOwner) {
            return res.status(403).json({ success: false, message: 'Not authorized to comment on this ticket' });
        }

        const comment = await TicketComment.create({
            ticket: req.params.id,
            user: req.user._id,
            comment: req.body.comment
        });
        res.status(201).json({ success: true, data: comment });
    } catch (error) {
        next(error);
    }
};

// @desc    Get ticket comments
// @route   GET /tickets/:id/comments
// @access  Private
exports.getComments = async (req, res, next) => {
    try {
        const Ticket = require('../models/Ticket');
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        // Check permissions: MANAGER; SUPPORT if assigned; USER if owner
        const isManager = req.user.role.name === 'MANAGER';
        const isAssignedSupport = req.user.role.name === 'SUPPORT' && ticket.assigned_to?.toString() === req.user._id.toString();
        const isOwner = req.user.role.name === 'USER' && ticket.created_by.toString() === req.user._id.toString();

        if (!isManager && !isAssignedSupport && !isOwner) {
            return res.status(403).json({ success: false, message: 'Not authorized to view comments for this ticket' });
        }

        const comments = await TicketComment.find({ ticket: req.params.id }).populate('user');
        res.status(200).json({ success: true, count: comments.length, data: comments });
    } catch (error) {
        next(error);
    }
};

// @desc    Update comment
// @route   PATCH /comments/:id
// @access  Private
exports.updateComment = async (req, res, next) => {
    try {
        let comment = await TicketComment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        if (comment.user.toString() !== req.user._id.toString() && req.user.role.name !== 'MANAGER') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        comment = await TicketComment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: comment });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete comment
// @route   DELETE /comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
    try {
        const comment = await TicketComment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        if (comment.user.toString() !== req.user._id.toString() && req.user.role.name !== 'MANAGER') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await comment.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};
