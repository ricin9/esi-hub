const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const registerUser = asyncHandler(async (req, res) => {
  const {body} = req

  // Check if account already exists
  const checkUser = await User.findOne({ email : body.email })
  if (checkUser) {
    res.status(400)
    throw new Error('Account already exists')
  }

  // hash password and create account
  const salt = await bcrypt.genSalt(10)
  body.password = await bcrypt.hash(body.password, salt)

  const user = await User.create(body)
  await user.populate('groups')
  res.status(201).json(user)
})

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // find user in database

  const user = await User.findOne({ email })

  if (!user || !await bcrypt.compare(password, user.password)) {
    res.status(400)
    throw new Error('Email or password incorrect')
  }

  // in case user found
  res.cookie('token', generateToken(user._id), { httpOnly: true, sameSite: false })
  const {groups} = await user.populate('groups', 'name')
  res.status(200).json({name: user.name, email : user.email, groups})
})

const updateUser = asyncHandler(async (req, res) => {
  
  // verify if user is admin or target
  if (req.params.id !== req.user._id && !req.admin) {
    res.status(401)
    throw new Error('Unauthorized operation, you have to login as target user or admin')
  }
  // get data from request body
  const { body } = req

  // find user
  const user = await User.findById(req.params.id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  // strip role modification if not admin
  body.groups = req.admin ? body.groups : null

  // hash password if new password is set
  if (body.password) {
    const salt = await bcrypt.genSalt(10)
    body.password = await bcrypt.hash(body.password, salt)
  }

  // save user
  for (const key in user) {
    if (body[key]) {
      user[key] = body[key]
    }
  }

  await user.save()
  res.status(200).json(user)
})

const deleteUser = asyncHandler(async (req, res) => {
  if (!req.admin) {
    res.status(401)
    throw new Error('Unauthorized, you need to be an admin')
  }

  const user = await User.findById(req.body.id)

  if(!user) {
    res.status(404)
    throw new Error('User not found')
  }
  await user.delete()

  res.status(200).json({
    id: req.body.id
  })
})

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password -createdAt -updatedAt -__v').populate('groups', 'name')

  if (users.length === 0) {
    res.status(404)
    throw new Error('no users found')
  }

  res.status(200).json(users)
})

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -createdAt -updatedAt -__v').populate('groups', 'name')

  if (!user) {
    res.status(404)
    throw new Error('user doesnt exist')
  }

  res.status(200).json(user)
})
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET)
}

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  getUsers,
  getCurrentUser
}