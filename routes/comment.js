const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/CommentController');

router.post('/:comment_id/like', CommentController.toggleLike);

module.exports = router;