const express = require('express');
const router = express.Router();
const {  getAllSubmissions,
    getSubmissionById,
    createSubmission,
    updateSubmission,
    deleteSubmission,
    updateSubmissionRemark, 
    updateSubmissionView} = require('../controllers/submissionController');

// Get all submissions
router.get('/submit', getAllSubmissions);

// Get a single submission by ID
router.get('/submit/:id', getSubmissionById);

// Create a new submission
router.post('/submit', createSubmission);

// Update a submission
router.put('/submit/:id', updateSubmission);

// Delete a submission
router.delete('/submit/:id', deleteSubmission);

// Update a submissionremark
router.put('/remark/:id', updateSubmissionRemark);

// Update a submission view
router.put('/view/:id', updateSubmissionView);

module.exports = router;
