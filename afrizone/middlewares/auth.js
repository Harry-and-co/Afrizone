const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Récupérer le token
      token = req.headers.authorization.split(' ')[1];
      
      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Ajouter l'utilisateur à la requête
      req.user = await User.findById(decoded.id).select('-password');
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Token invalide' });
    }
  }
  
  if (!token) {
    res.status(401).json({ message: 'Non autorisé, token manquant' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Accès interdit' });
  }
};

module.exports = { protect, admin };
