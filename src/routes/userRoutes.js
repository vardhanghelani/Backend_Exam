const express = require('express');
const { getUsers, mkUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const router = express.Router();

router.use(protect);
router.use(authorize('MANAGER'));

router.get('/', getUsers);
router.post('/', mkUser);

module.exports = router;
