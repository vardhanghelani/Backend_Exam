const express = require('express');
const { editComm, killComm } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.patch('/:id', editComm);
router.delete('/:id', killComm);

module.exports = router;
