const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  cost: {
    type: Number,
    required: true
  },
  purchasePrice: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  minimumQuantity: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema); 