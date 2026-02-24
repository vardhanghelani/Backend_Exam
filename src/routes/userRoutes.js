const express = require('express');
const { getUsers, createUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const router = express.Router();

router.use(protect);
router.use(authorize('MANAGER'));

router.get('/', getUsers);
router.post('/', createUser);

module.exports = router;
