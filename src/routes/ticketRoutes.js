const express = require('express');
const {
    createTicket,
    getTickets,
    assignTicket,
    updateTicketStatus,
    deleteTicket
} = require('../controllers/ticketController');
const { addComment, getComments } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.use(protect);

router.post('/', authorize('USER', 'MANAGER'), createTicket);
router.get('/', getTickets);
router.patch('/:id/assign', authorize('MANAGER', 'SUPPORT'), assignTicket);
router.patch('/:id/status', updateTicketStatus);
router.delete('/:id', authorize('MANAGER'), deleteTicket);

// Comment sub-routes
router.post('/:id/comments', addComment);
router.get('/:id/comments', getComments);

module.exports = router;
