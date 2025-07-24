const express = require('express');
const router = express.Router();
const { 
  addOrderItems, 
  getOrderById, 
  updateOrderToPaid, 
  updateOrderToDelivered,
  getMyOrders,
  getOrders
} = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/auth');

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);
  
router.get('/myorders', protect, getMyOrders);
  
router.route('/:id')
  .get(protect, getOrderById);
  
router.put('/:id/pay', protect, updateOrderToPaid);
router.put('/:id/deliver', protect, admin, updateOrderToDelivered);

module.exports = router;
