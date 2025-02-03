const mongoose = require('mongoose');

// Define Product Schema
const ProductSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',  // This links to the Seller model
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  image: {
    type: String,  // URL of the image
    required: false,
  },
}, {
  timestamps: true,  // Automatically adds createdAt and updatedAt fields
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;