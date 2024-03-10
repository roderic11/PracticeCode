const express = require('express');
const router = express.Router();
const {   AddComment,
    FindAllComments,
    FindComment,
    UpdateComment,
    DeleteComment,
    updateCommentView,
} = require('../controllers/commentController');

// Get all submissions
router.get('/comment',  FindAllComments);

// Get a single submission by ID
router.get('/comment/:id', FindComment);

// Create a new submission
router.post('/comment', AddComment);

// Update a submission info
router.put('/comment/:id', UpdateComment);

// Update a submission view
router.put('/view/:id', updateCommentView);


// Delete a submission
router.delete('/comment/:id', DeleteComment);

module.exports = router;