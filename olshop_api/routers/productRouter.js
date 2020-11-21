const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/get-products', productController.getProducts);
router.get('/get-root-category', productController.getRootCat);
router.get('/leafCat', productController.getLeafCat);
router.post('/add/:leafnode', productController.addProduct);

module.exports = router;
