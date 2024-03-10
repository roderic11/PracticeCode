const asyncHandler = require('express-async-handler');
const Submission = require("../models/submissionModel");

// Get all submissions
const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find();
    res.status(200).json(submissions);
  } catch (error) {
    console.error("Failed to fetch submissions:", error);
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
};

// Get a single submission by ID
const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id);
    
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    
    res.status(200).json(submission);
  } catch (error) {
    console.error("Failed to fetch submission:", error);
    res.status(500).json({ message: "Failed to fetch submission" });
  }
};

// Create a new submission
const createSubmission = async (req, res) => {
  try {
    const {tableData, title, date, dateRequested,dateNeeded,targetDelivery, targetSubmission,sender,location} = req.body;
   
    // Create a new submission document with the table data
    const submission = new Submission({ tableData,targetSubmission, title,date,sender,location,dateRequested,dateNeeded,targetDelivery});
    await submission.save();

    res.status(201).json({ message: "Submission created successfully", submission });
  } catch (error) {
    console.error("Failed to create submission:", error);
    res.status(500).json({ message: "Failed to create submission" });
  }
};

// Update a submission
const updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const tableData = req.body;

    const submission = await Submission.findByIdAndUpdate(id, { tableData }, { new: true });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.status(200).json({ message: "Submission updated successfully", submission });
  } catch (error) {
    console.error("Failed to update submission:", error);
    res.status(500).json({ message: "Failed to update submission" });
  }
};

const updateSubmissionRemark = asyncHandler(async (req, res) => {
  const { remark } = req.body;


  const submission = await Submission.findById(req.params.id);

  if (submission) {
    
   
    submission.remark = remark || submission.remark;
 
    
    const updatedSubmission = await submission.save();
    res.json(updatedSubmission);
  } else {
    res.status(404);
    throw new Error("Submission not found");
  }
});

const updateSubmissionView = asyncHandler(async (req, res) => {
  const { view } = req.body;

  const submission = await Submission.findById(req.params.id);

  if (submission) {
    
    submission.view = view || submission.view;
 
    const updatedSubmission = await submission.save();
    res.json(updatedSubmission);
  } else {
    res.status(404);
    throw new Error("Submission not found");
  }
});
// Delete a submission
const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findByIdAndDelete(id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.status(200).json({ message: "Submission deleted successfully" });
  } catch (error) {
    console.error("Failed to delete submission:", error);
    res.status(500).json({ message: "Failed to delete submission" });
  }
};

module.exports = {
  getAllSubmissions,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  deleteSubmission,
  updateSubmissionRemark,
  updateSubmissionView,
};
