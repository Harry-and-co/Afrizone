const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  createProductReview,
  getTopProducts
} = require('../controllers/productController');
const { protect, admin } = require('../middlewares/auth');

router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);
  
router.get('/top', getTopProducts);
  
router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);
  
router.post('/:id/reviews', protect, createProductReview);

module.exports = router;
