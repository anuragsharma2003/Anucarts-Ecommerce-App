const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Refers to User model, to identify the user who placed the order
    required: true
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Refers to Product model, to identify which product was ordered
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      itemTotalPrice: {
        type: Number,
        required: true // Total price for the quantity of the product (quantity * price)
      },
      name: {
        type: String,
        required: true
      },
      image: {
        type: String,
        required: true
      },
      sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller', // Refers to Seller model, to identify the seller
        required: true
      }
    }
  ],
  orderTotalPrice: {
    type: Number,
    required: true // Total price of the order (sum of all itemTotalPrices)
  },
  paymentId: {
    type: String,
    required: true // ID for payment reference from Razorpay or any payment provider
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Shipped', 'Delivered', 'Undelivered', 'Cancelled'],
    default: 'Pending'
  },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;