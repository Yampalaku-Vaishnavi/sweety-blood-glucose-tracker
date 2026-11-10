const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const {
  create,
  list,
  getById,
  update,
  remove,
} = require('../controllers/readingController');

const router = express.Router();

router.use(authenticateToken);
router.post('/', create);
router.get('/', list);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
