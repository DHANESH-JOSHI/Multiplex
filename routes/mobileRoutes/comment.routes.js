const express = require("express");
const router = express.Router();
const { getAllComments, createComment, getCommentById, updateComment, deleteComment } = require('../../controllers/mobileControllers/comment.controller');

router.get('/', getAllComments);
router.post('/', createComment);
router.get('/:id', getCommentById);
router.put('/:id', updateComment);
router.delete('/', deleteComment);

module.exports = router;
