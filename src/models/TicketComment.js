const mongoose = require('mongoose');

const ticketCommentSchema = new mongoose.Schema({
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: String,
        required: true,
        minlength: 2
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TicketComment', ticketCommentSchema);
