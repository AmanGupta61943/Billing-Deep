const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
  try {
    let sortCriteria = {};
    const sortBy = req.query.sortBy;

    if (sortBy) {
      switch (sortBy) {
        case 'name_asc':
          sortCriteria = { name: 1 };
          break;
        case 'quantity_asc':
          sortCriteria = { quantity: 1 };
          break;
        case 'quantity_desc':
          sortCriteria = { quantity: -1 };
          break;
        case 'lastUpdated_asc':
          sortCriteria = { lastUpdated: 1 };
          break;
        case 'lastUpdated_desc':
        default:
          sortCriteria = { lastUpdated: -1 }; // Default to latest modified if sortBy is invalid or not provided
          break;
      }
    }

    const products = await Product.find().sort(sortCriteria);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: err.message });
  }
});

// Search products by name or barcode
router.get('/search', async (req, res) => {
  const searchTerm = req.query.q;
  if (!searchTerm) {
    return res.status(400).json({ message: 'Search term is required' });
  }

  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive name search
        { barcode: { $regex: searchTerm, $options: 'i' } } // Case-insensitive barcode search
      ]
    }).limit(5); // Limit to top 5 suggestions
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Error searching products' });
  }
});

// Must be registered before /:id so "barcode" is not captured as an id
router.get('/barcode/:barcode', async (req, res) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error finding product by barcode:', error);
    res.status(500).json({ message: 'Error finding product' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error fetching single product:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const { name, barcode, quantity, purchasePrice, cost, minimumQuantity } = req.body;

    const qty = quantity === '' || quantity === undefined ? NaN : Number(quantity);
    const purchase = purchasePrice === '' || purchasePrice === undefined ? NaN : Number(purchasePrice);
    const costNum = cost === '' || cost === undefined ? NaN : Number(cost);

    if (!name || String(name).trim() === '') {
      return res.status(400).json({ message: 'Product name is required.' });
    }
    if (Number.isNaN(qty) || qty < 0) {
      return res.status(400).json({ message: 'Valid quantity is required (0 or greater).' });
    }
    if (Number.isNaN(purchase) || purchase < 0) {
      return res.status(400).json({ message: 'Valid purchase price is required.' });
    }
    if (Number.isNaN(costNum) || costNum < 0) {
      return res.status(400).json({ message: 'Valid retail / cost price is required.' });
    }

    const product = new Product({
      name: String(name).trim(),
      barcode: barcode != null && String(barcode).trim() !== '' ? String(barcode).trim() : undefined,
      quantity: qty,
      purchasePrice: purchase,
      cost: costNum,
      minimumQuantity:
        minimumQuantity === '' || minimumQuantity === undefined
          ? 0
          : Math.max(0, Number(minimumQuantity) || 0),
      lastUpdated: new Date(),
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error('Error creating product:', err);
    if (err && err.code === 11000) {
      return res.status(409).json({
        message: 'A product with this barcode already exists. Use a different barcode or generate a new one.',
      });
    }
    res.status(400).json({ message: err.message || 'Could not create product.' });
  }
});

// Update product
router.patch('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Explicitly update allowed fields
    const allowedUpdates = ['name', 'barcode', 'quantity', 'purchasePrice', 'cost', 'discount', 'minimumQuantity'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates!' });
    }

    updates.forEach((update) => {
      if (update === 'quantity' || update === 'purchasePrice' || update === 'cost' || update === 'discount' || update === 'minimumQuantity') {
        product[update] = Number(req.body[update]);
      } else {
        product[update] = req.body[update];
      }
    });

    product.lastUpdated = Date.now();

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update stock quantity
router.patch('/:id/stock', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { quantity, operation } = req.body;
    if (operation === 'add') {
      product.quantity += Number(quantity);
    } else if (operation === 'subtract') {
      if (product.quantity < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      product.quantity -= Number(quantity);
    }

    product.lastUpdated = Date.now();
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    console.error('Error updating stock:', err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router; 