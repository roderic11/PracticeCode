const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const Product = require('../models/newInventoryModel');


//get method
router.get('/getInventory', (req, res) => {
  Product.find()
    .then(products => {
      res.json(products);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error retrieving products');
    });
});

// POST method to create a new inventory
router.post('/createInventory', [
  body('product').notEmpty(),
  body('unit').notEmpty(),
  body('quantity').notEmpty(),
  
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const newProduct = new Product({
    product: req.body.product,
    unit: req.body.unit,
    quantity: req.body.quantity,
   
  
  });

  newProduct.save()
    .then(product => {
      res.status(201).json(product);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error saving product');
    });
});

// Update a product by ID
router.put('/updateInventory/:id', [
  param('id').isMongoId(),
  body('product').notEmpty(),
  body('unit').notEmpty(),
  body('quantity').notEmpty(),
 
 
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;

  Product.findByIdAndUpdate(id, req.body, { new: true })
    .then(updatedProduct => {
      res.json(updatedProduct);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error updating product');
    });
});

// Delete a product by ID
router.delete('/deleteInventory/:id', [
  param('id').isMongoId()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;

  Product.findByIdAndDelete(id)
    .then(deletedProduct => {
      res.json(deletedProduct);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error deleting product');
    });
});

// Retrieve a product by ID
router.get('/api/inventories/:id', [
  param('id').isMongoId()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;

  Product.findById(id)
    .then(product => {
      if (!product) {
        return res.status(404).send('Product not found');
      }
      res.json(product);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error retrieving product');
    });
});

module.exports = router;
