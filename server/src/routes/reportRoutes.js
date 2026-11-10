const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const {
  daily,
  monthToDate,
  monthly,
} = require('../controllers/reportController');

const router = express.Router();

router.use(authenticateToken);
router.get('/daily', daily);
router.get('/month-to-date', monthToDate);
router.get('/monthly', monthly);

module.exports = router;
