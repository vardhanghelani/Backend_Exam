const express = require('express');
const {
    mkTkt,
    getTkts,
    setAssigned,
    updStat,
    killTkt
} = require('../controllers/ticketController');
const { mkComm, getComms } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.use(protect);

router.post('/', authorize('USER', 'MANAGER'), mkTkt);
router.get('/', getTkts);
router.patch('/:id/assign', authorize('MANAGER', 'SUPPORT'), setAssigned);
router.patch('/:id/status', updStat);
router.delete('/:id', authorize('MANAGER'), killTkt);

router.post('/:id/comments', mkComm);
router.get('/:id/comments', getComms);

module.exports = router;
