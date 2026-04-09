const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Create new bill
router.post('/', async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod } = req.body;

    // Create bill items, mapping relevant fields from incoming items
    const billItems = items.map(item => {
      const billItem = {
        name: item.name, // Include name
        barcode: item.barcode || '', // Include barcode, default to empty string if missing
        quantity: item.quantity,
        price: item.price && !isNaN(item.price) ? item.price : 0 // Ensure price is a valid number
      };
      // Only add product reference if _id is a valid ObjectId
      if (item._id && mongoose.Types.ObjectId.isValid(item._id)) { // Also check if _id exists
        billItem.product = item._id;
      } else {
        console.log(`Creating bill item for temporary product with ID: ${item._id}. No product reference added.`);
      }
      return billItem;
    });

    // Basic validation to ensure there are items and they have required fields (name, quantity, and price should be present and valid)
    if (!billItems || billItems.length === 0 || billItems.some(item => !item.name || item.quantity === undefined || item.price === undefined || isNaN(item.quantity) || isNaN(item.price))) {
      return res.status(400).json({ message: 'Bill must contain items with valid name, quantity, and price.' });
    }

    // Create the bill
    const bill = new Bill({
      items: billItems,
      totalAmount,
      paymentMethod,
      date: new Date()
    });

    // Update product quantities for items that are in stock management
    for (const item of items) {
      // Check if the item._id is a valid MongoDB ObjectId before attempting to update stock
      if (item._id && mongoose.Types.ObjectId.isValid(item._id)) { // Also check if _id exists
        try {
          await Product.findByIdAndUpdate(item._id, {
            $inc: { quantity: -item.quantity }
          });
        } catch (stockUpdateError) {
          console.error(`Error updating stock for product ${item._id}:`, stockUpdateError);
          // Continue with bill creation even if stock update for one item fails
        }
      } else {
        console.log(`Skipping stock update for temporary item with ID: ${item._id}`);
      }
    }

    const savedBill = await bill.save();
    res.status(201).json(savedBill);
  } catch (err) {
    console.error('Error creating bill:', err);
    // Check if it's a validation error and provide more specific message if possible
    if (err.name === 'ValidationError') {
      // Log validation errors for debugging
      console.error('Bill validation errors:', err.errors);
      res.status(400).json({ message: 'Bill validation failed: ' + err.message });
    } else {
      res.status(400).json({ message: err.message });
    }
  }
});

// Get all bills
router.get('/', async (req, res) => {
  try {
    // When fetching bills, handle items that might not have a product reference
    const bills = await Bill.find()
      // Only populate if the 'product' field exists in the bill item
      .populate({
        path: 'items.product',
        // This match ensures we only try to populate if product is not null and exists
        match: { _id: { $exists: true } }
      })
      .sort({ date: -1 });

    // Post-process to include details for items that weren't populated (temporary items)
    const processedBills = bills.map(bill => ({
      ...bill.toObject(), // Convert Mongoose document to plain object
      items: bill.items.map(item => ({
        ...item.toObject(),
        // If product was not populated, use the name/barcode stored directly in the bill item
        product: item.product ? item.product : { _id: item._id, name: item.name || 'Temporary Item', barcode: item.barcode || 'N/A' }
      }))
    }));

    res.json(processedBills);
  } catch (err) {
    console.error('Error fetching bills:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get single bill
router.get('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate({
        path: 'items.product',
        match: { _id: { $exists: true } }
      });
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Post-process similar to get all bills
    const processedBill = bill.toObject();
    processedBill.items = processedBill.items.map(item => ({
      ...item,
      // If product was not populated, use the name/barcode stored directly in the bill item
      product: item.product ? item.product : { _id: item._id, name: item.name || 'Temporary Item', barcode: item.barcode || 'N/A' }
    }));

    res.json(processedBill);
  } catch (err) {
    console.error('Error fetching bill:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 