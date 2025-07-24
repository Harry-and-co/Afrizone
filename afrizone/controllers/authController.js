const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../config/jwt');
const bcrypt = require('bcryptjs');

// @desc    Authentifier un utilisateur
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email });
  
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error('Email ou mot de passe invalide');
  }
});

// @desc    Enregistrer un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  
  const userExists = await User.findOne({ email });
  
  if (userExists) {
    res.status(400);
    throw new Error('Cet email est déjà utilisé');
  }
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword
  });
  
  if (user) {
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } else {
    res.status(400);
    throw new Error('Données utilisateur invalides');
  }
});

// @desc    Obtenir le profil utilisateur
// @route   GET /api/auth/profile
// @access  Privé
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }
});

// @desc    Mettre à jour le profil utilisateur
// @route   PUT /api/auth/profile
// @access  Privé
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    
    if (req.body.address) {
      user.address = {
        street: req.body.address.street || user.address.street,
        city: req.body.address.city || user.address.city,
        country: req.body.address.country || user.address.country,
        postalCode: req.body.address.postalCode || user.address.postalCode
      };
    }
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      role: updatedUser.role
    });
  } else {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }
});

// @desc    Ajouter un produit aux favoris
// @route   POST /api/auth/favorites/:id
// @access  Privé
const addToFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.id;
  
  if (user) {
    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save();
    }
    res.json({ message: 'Produit ajouté aux favoris' });
  } else {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }
});

// @desc    Supprimer un produit des favoris
// @route   DELETE /api/auth/favorites/:id
// @access  Privé
const removeFromFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.id;
  
  if (user) {
    user.favorites = user.favorites.filter(
      fav => fav.toString() !== productId
    );
    await user.save();
    res.json({ message: 'Produit supprimé des favoris' });
  } else {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }
});

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  addToFavorites,
  removeFromFavorites
};