const express = require('express');
const router = express.Router();
const { sendRequest, getConnections, updateConnection } = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getConnections).post(protect, sendRequest);
router.route('/:id').put(protect, updateConnection);

module.exports = router;
