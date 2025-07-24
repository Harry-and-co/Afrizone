const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Obtenir tous les utilisateurs (admin)
// @route   GET /api/users
// @access  Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

// @desc    Obtenir un utilisateur par ID (admin)
// @route   GET /api/users/:id
// @access  Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }
});

// @desc    Mettre à jour un utilisateur (admin)
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.role = req.body.role || user.role;
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role
    });
  } else {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }
});

// @desc    Supprimer un utilisateur (admin)
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (user) {
    await user.remove();
    res.json({ message: 'Utilisateur supprimé' });
  } else {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }
});

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};
