const mongoose = require('mongoose');

// Define SellerOrder Schema
const SellerOrderSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller', // Referencing Seller model
    required: true,
  },
  orders: [
    {
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order', // Reference to the main order
        required: true,
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the user who placed the order
        required: true,
      },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the product in the order
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      totalPrice: {
        type: Number,
        required: true, // Total price for this product
      },
      status: {
        type: String,
        enum: ['Pending', 'Shipped', 'Paid', 'Undelivered', 'Delivered', 'Cancelled'],
        default: 'Pending',
      },
    },
  ],
}, { timestamps: true });

const SellerOrder = mongoose.model('SellerOrder', SellerOrderSchema);

module.exports = SellerOrder;