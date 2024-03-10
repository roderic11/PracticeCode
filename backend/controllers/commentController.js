const asyncHandler = require('express-async-handler');
const Comment = require("../models/commentModel");

const AddComment = async (req, res) => {
  try {
    const newComment = await Comment.create(req.body);
    res.status(201).json({ message: "Comment added with success", comment: newComment });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

const FindAllComments = async (req, res) => {
  try {
    const comments = await Comment.find();
    res.status(200).json(comments);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

const FindComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id });
    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
    } else {
      res.status(200).json(comment);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Failed to fetch comment" });
  }
};

const UpdateComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id });
    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
    } else {
      comment.title = req.body.title || comment.title;
      comment.location = req.body.location || comment.location;
      comment.remarks = req.body.remarks || comment.remarks;
      comment.comment = req.body.comment || comment.comment;
      comment.tableData = req.body.tableData || comment.tableData;
      comment.dateNeeded = req.body.dateNeeded || comment.dateNeeded;
      comment.targetDelivery = req.body.targetDelivery || comment.targetDelivery;
      comment.dateRequested = req.body.dateRequested || comment.dateRequested;
      comment.date = req.body.date || comment.date;
      comment.time = req.body.time || comment.time;
      comment.deliveryId = req.body.deliveryId || comment.deliveryId;

      const updatedComment = await comment.save();
      res.status(200).json({ message: "Comment updated with success", comment: updatedComment });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Failed to update comment" });
  }
};

const DeleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id });
    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
    } else {
      await comment.remove();
      res.status(200).json({ message: "Comment deleted with success" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};
const updateCommentView = asyncHandler(async (req, res) => {
  const { view } = req.body;

  const comment = await Comment.findById(req.params.id);

  if (comment) {
    
    comment.view = view || comment.view;
 
    const updatedComment = await comment.save();
    res.json(updatedComment);
  } else {
    res.status(404);
    throw new Error("Comment's view not found");
  }
});

module.exports = {
  AddComment,
  FindAllComments,
  FindComment,
  UpdateComment,
  DeleteComment,
  updateCommentView,

};
