const commentService = require('../../services/mobileServices/comment.service');

module.exports = {
  /**
   * Handle GET request for all comments.
   */
  getAllComments: async (req, res) => {
    try {
      const comments = await commentService.getAllComments();
      res.status(200).json({
        status: 'success',
        data: comments
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  /**
   * Handle POST request to create a new comment.
   */
  createComment: async (req, res) => {
    try {
      const newComment = await commentService.createComment(req.body);
      res.status(201).json({
        status: 'success',
        data: newComment
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  /**
   * Handle GET request for a single comment by ID.
   */
  getCommentById: async (req, res) => {
    try {
      const comment = await commentService.getCommentById(req.params.id);
      if (!comment) {
        return res.status(404).json({
          status: 'error',
          message: 'Comment not found'
        });
      }
      res.status(200).json({
        status: 'success',
        data: comment
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  /**
   * Handle PUT/PATCH request to update a comment by ID.
   */
  updateComment: async (req, res) => {
    try {
      const updatedComment = await commentService.updateComment(req.params.id, req.body);
      if (!updatedComment) {
        return res.status(404).json({
          status: 'error',
          message: 'Comment not found'
        });
      }
      res.status(200).json({
        status: 'success',
        data: updatedComment
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  /**
   * Handle DELETE request to remove a comment by ID.
   */
  deleteComment: async (req, res) => {
    try {
      const deletedComment = await commentService.deleteComment(req.params.id);
      if (!deletedComment) {
        return res.status(404).json({
          status: 'error',
          message: 'Comment not found'
        });
      }
      res.status(200).json({
        status: 'success',
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
};
