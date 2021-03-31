const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');

router.get('/', ProductController.products);
router.get('/test', ProductController.test);
router.get('/:product_id/comments', ProductController.comments);
router.get('/:product_id/content', ProductController.content);

module.exports = router;