const Comment = require('../../models/comments.model');

/**
 * Retrieve all comments from the database.
 * @returns {Promise<Array>} An array of comments with populated user and video fields.
 */
const getAllComments = async () => {
  try {
    return await Comment.find({}).populate('user').populate('video');
  } catch (error) {
    throw new Error('Error retrieving comments: ' + error.message);
  }
};

/**
 * Create a new comment in the database.
 * @param {Object} commentData - Data for creating a new comment.
 * @returns {Promise<Object>} The newly created comment document.
 */
const createComment = async (commentData) => {
  try {
    const comment = new Comment(commentData);
    return await comment.save();
  } catch (error) {
    throw new Error('Error creating comment: ' + error.message);
  }
};

/**
 * Retrieve a single comment by its ID.
 * @param {String} id - The comment's ID.
 * @returns {Promise<Object|null>} The comment document, or null if not found.
 */
const getCommentById = async (id) => {
  try {
    return await Comment.findById(id).populate('user').populate('video');
  } catch (error) {
    throw new Error('Error retrieving comment: ' + error.message);
  }
};

/**
 * Update a comment by its ID.
 * @param {String} id - The comment's ID.
 * @param {Object} updateData - Fields to update.
 * @returns {Promise<Object|null>} The updated comment document, or null if not found.
 */
const updateComment = async (id, updateData) => {
  try {
    return await Comment.findByIdAndUpdate(id, updateData, { new: true })
      .populate('user')
      .populate('video');
  } catch (error) {
    throw new Error('Error updating comment: ' + error.message);
  }
};

/**
 * Delete a comment by its ID.
 * @param {String} id - The comment's ID.
 * @returns {Promise<Object|null>} The deleted comment document, or null if not found.
 */
const deleteComment = async (id) => {
  try {
    return await Comment.findByIdAndDelete(id);
  } catch (error) {
    throw new Error('Error deleting comment: ' + error.message);
  }
};

module.exports = {
  getAllComments,
  createComment,
  getCommentById,
  updateComment,
  deleteComment
};
