const mongoose = require('mongoose');

// Define Seller Schema
const SellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email is unique
  },
  password: {
    type: String,
    required: true,
  },
});

// Create Seller Model
const Seller = mongoose.model('Seller', SellerSchema);

module.exports = Seller;