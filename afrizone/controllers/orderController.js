const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');

// @desc    Créer une nouvelle commande
// @route   POST /api/orders
// @access  Privé
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    items,
    shippingAddress,
    paymentMethod
  } = req.body;
  
  if (items && items.length === 0) {
    res.status(400);
    throw new Error('Aucun article dans la commande');
  } else {
    // Calculer le prix total
    const totalPrice = items.reduce((acc, item) => {
      return acc + (item.price * item.quantity);
    }, 0);
    
    const order = new Order({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      totalPrice
    });
    
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
});

// @desc    Obtenir une commande par ID
// @route   GET /api/orders/:id
// @access  Privé
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'firstName lastName email')
    .populate('items.product', 'name image price');
  
  if (order) {
    // Vérifier que l'utilisateur est le propriétaire ou admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Non autorisé');
    }
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Commande non trouvée');
  }
});

// @desc    Mettre à jour le statut de paiement
// @route   PUT /api/orders/:id/pay
// @access  Privé
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  
  if (order) {
    order.paymentStatus = 'completed';
    await order.save();
    
    res.json({ message: 'Paiement effectué' });
  } else {
    res.status(404);
    throw new Error('Commande non trouvée');
  }
});

// @desc    Mettre à jour le statut de livraison
// @route   PUT /api/orders/:id/deliver
// @access  Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  
  if (order) {
    order.status = 'delivered';
    order.deliveredAt = Date.now();
    await order.save();
    
    res.json({ message: 'Commande livrée' });
  } else {
    res.status(404);
    throw new Error('Commande non trouvée');
  }
});

// @desc    Obtenir les commandes d'un utilisateur
// @route   GET /api/orders/myorders
// @access  Privé
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Obtenir toutes les commandes (admin)
// @route   GET /api/orders
// @access  Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'firstName lastName')
    .sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders
};
