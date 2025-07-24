const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Obtenir tous les produits
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { category, search, sort, page = 1, limit = 12 } = req.query;
  
  const query = {};
  
  if (category && category !== 'all') {
    query.category = category;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  const sortOptions = {};
  if (sort) {
    if (sort === 'price_asc') sortOptions.price = 1;
    else if (sort === 'price_desc') sortOptions.price = -1;
    else if (sort === 'rating') sortOptions.averageRating = -1;
    else if (sort === 'newest') sortOptions.createdAt = -1;
  }
  
  const skip = (page - 1) * limit;
  
  const products = await Product.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));
  
  const count = await Product.countDocuments(query);
  
  res.json({
    products,
    page: parseInt(page),
    pages: Math.ceil(count / limit),
    total: count
  });
});

// @desc    Obtenir un produit par ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    'ratings.user',
    'firstName lastName'
  );
  
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Produit non trouvé');
  }
});

// @desc    Créer un nouveau produit
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    origin: req.body.origin,
    images: req.body.images,
    stock: req.body.stock,
    seller: req.user._id
  });
  
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Mettre à jour un produit
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, origin, images, stock } = req.body;
  
  const product = await Product.findById(req.params.id);
  
  if (product) {
    product.name = name;
    product.description = description;
    product.price = price;
    product.category = category;
    product.origin = origin;
    product.images = images;
    product.stock = stock;
    
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Produit non trouvé');
  }
});

// @desc    Supprimer un produit
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (product) {
    await product.remove();
    res.json({ message: 'Produit supprimé' });
  } else {
    res.status(404);
    throw new Error('Produit non trouvé');
  }
});

// @desc    Ajouter une évaluation à un produit
// @route   POST /api/products/:id/reviews
// @access  Privé
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  
  const product = await Product.findById(req.params.id);
  
  if (product) {
    const alreadyReviewed = product.ratings.find(
      r => r.user.toString() === req.user._id.toString()
    );
    
    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Vous avez déjà évalué ce produit');
    }
    
    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment
    };
    
    product.ratings.push(review);
    
    // Calculer la nouvelle note moyenne
    const sum = product.ratings.reduce((acc, item) => acc + item.rating, 0);
    product.averageRating = sum / product.ratings.length;
    
    await product.save();
    res.status(201).json({ message: 'Évaluation ajoutée' });
  } else {
    res.status(404);
    throw new Error('Produit non trouvé');
  }
});

// @desc    Obtenir les produits les plus populaires
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({})
    .sort({ averageRating: -1 })
    .limit(5);
  
  res.json(products);
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts
};
