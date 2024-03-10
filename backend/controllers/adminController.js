const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const Admin = require('../models/adminModel');

// @desc    Authenticate a admin
// @route   POST /api/admins/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for admin email
  const admin = await Admin.findOne({ email });

  if (admin && (await bcrypt.compare(password, admin.password))) {
    res.json({
      _id: admin.id,
      name: admin.name,
      email: admin.email,
      roles: admin.roles, // Include roles in the response
      token: generateToken(admin._id, admin.roles),
    });
  } else {
    res.status(400);
    throw new Error('Invalid credentials');
    
  }
});


// @desc    Get admin data
// @route   GET /api/admins/me
// @access  Private
const getAdmin = asyncHandler(async (req, res) => {
    res.status(200).json(req.admin)
  })
  
  // Generate JWT
  const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    })
  }
  
// @desc    Create new admin
// @route   POST /api/admins
// @access  Private
const createAdmin = asyncHandler(async (req, res) => {
    const { roles, name, email, password } = req.body
  
    // Confirm Data
    if (!roles || !name || !email || !password) {
      res.status(400)
      throw new Error('Please add all fields')
    }
  
    // Check if admin exists
    const adminExists = await Admin.findOne({ email })
  
    if (adminExists) {
      res.status(400)
      throw new Error('Admin already exists')
    }
  
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
  
    // Create admin
    const admin = await Admin.create({
      roles,
      name,
      email,
      password: hashedPassword,
    })
  
    if (admin) {
      res.status(201).json({
        _id: admin.id,
        roles: admin.roles,
        name: admin.name,
        email: admin.email,
        token: generateToken(admin._id),
      })
    } else {
      res.status(400)
      throw new Error('Invalid admin data')
    }
    
  })
// @desc Update a admin
// @routes PATCH /admins
// @access Private

const updateAdmin =  asyncHandler(async(req, res) => {
    const { id, roles, name, email, password } = req.body

    //Confirm data
    if (!id || !name || !email || !roles.length) {
        res.status(400)
        throw new Error('Please add all fields')
    }

    const admin = await Admin.findById(id).exec()

    if (!admin) {
        return res.status(400).json({message: 'Admin not found'})
    }

    // Check for duplicate
    const duplicate = await Admin.findOne({ email }).lean().exec()
    // Allow updates to the original admin
    if (duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({message: 'Duplicate Email'})
    }

    admin.email = email
    admin.roles = roles
    //admin.name = name

    if (password) {
        //Hash password
        admin.password = await bcrypt.hash(password, 10) // salt rounds
    }

    const updatedAdmin = await admin.save()

    res.json({ message: `${updatedAdmin.email} updated`})
});

// @desc Delete a admin
// @routes DELETE /admins
// @access Private

const deleteAdmin =  asyncHandler(async(req, res) => {
    const {id} = req.body;

    //Confirm Data
    if (!id ){
        return res.status(400).json({message: 'Admin ID Required'})
    }
    // Does the admin exist to delete?
    const admin = await Admin.findById(id).exec()

    if (!admin){
        return res.status(400).json({ message: 'Admin not found'})
    }

    const result = await admin.deleteOne()

    const reply = `Email ${result.email} with ID ${result._id}
    deleted`

    res.json(reply)
});



module.exports = {
    loginAdmin,
    getAdmin,
    createAdmin,
    updateAdmin,
    deleteAdmin,
};