const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

// Get all user
const getAllUser = asyncHandler(async (req, res) => {
  const user = await User.find();
  res.status(200).json(user);
});

// Update an existing user
const updateUser = asyncHandler(async (req, res) => {
  const { roles, name, email, password, projectId } = req.body;
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user data
    user.roles = roles;
    user.projectId = projectId;
    user.name = name;
    user.email = email;
    user.password = hashedPassword;

    const updatedUser = await user.save();

    // Generate token
    const token = generateToken(updatedUser._id);

    res.status(200).json({
      _id: updatedUser._id,
      roles: updatedUser.roles,
      projectId: updatedUser.projectId,
      name: updatedUser.name,
      email: updatedUser.email,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Delete an user
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Confirm Data
  if (!id) {
    return res.status(400).json({ message: 'User ID Required' });
  }

  // Does the user exist to delete?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  const result = await user.deleteOne();

  const reply = `User with ID ${result._id} deleted`;

  res.json(reply);
});
// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, roles, projectId } = req.body

  if (!name || !email || !password) {
    res.status(400)
    throw new Error('Please add all fields')
  }

  // Check if user exists
  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error('User already exists')
  }

  // Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  // Create user
  const user = await User.create({
    name,
    email,
    roles,
    projectId,
    password: hashedPassword,
  })

  if (user) {
    res.status(201).json({
      _id: user.id,
      roles: user.roles,
      projectId: user.projectId,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Check for user email
  const user = await User.findOne({ email })

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      roles: user.roles,
      projectId: user.projectId,
      email: user.email,
      token: generateToken(user._id),
    })
  } else {
    res.status(400)
    throw new Error('Invalid credentials')
  }
})

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user)
})

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}
// Get a single user by ID
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(200).json(user);
});
module.exports = {
  registerUser,
  loginUser,
  getMe,
  deleteUser,
  getAllUser,
  updateUser,
  getUserById,
}