const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Seller = require('../models/Seller');
const SellerOrder = require('../models/SellerOrder');
const authMiddleware = require('../middlewares/authMiddleware');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // Import Cloudinary Storage
const multer = require('multer');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'anucarts_order_images', // Cloudinary folder for order-related images
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const upload = multer({ storage });

// Handle image uploads (if needed, for example, if the order image is updated)
router.post('/uploadImage', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  res.status(200).json({ imageUrl: req.file.path }); // Send the image URL after uploading
});

// Create an order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, orderTotalPrice, paymentId, status } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Upload images for items if they don't have a Cloudinary URL
    for (let item of items) {
      if (!item.image && item.productId) {
        const product = await Product.findById(item.productId);
        if (product && product.image) {
          item.image = product.image; // Use product image if already uploaded
        } else {
          // Upload image if not present
          const uploadResponse = await cloudinary.uploader.upload(item.image, {
            folder: 'anucarts_order_images',
            allowed_formats: ['jpg', 'jpeg', 'png'],
          });
          item.image = uploadResponse.secure_url; // Assign uploaded image URL
        }
      }
    }

    // Create the order object
    const order = new Order({
      userId,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        itemTotalPrice: item.itemTotalPrice,
        name: item.name,
        image: item.image,
        sellerId: item.sellerId
      })),
      orderTotalPrice,
      paymentId,
      status
    });

    const savedOrder = await order.save();

    // Update seller orders
    await Promise.all(
      items.map(async (item) => {
        const seller = await Seller.findById(item.sellerId);
        if (!seller) {
          return res.status(400).json({ message: `Seller with ID ${item.sellerId} not found` });
        }

        const sellerOrder = await SellerOrder.findOne({ sellerId: item.sellerId });
        if (!sellerOrder) {
          const newSellerOrder = new SellerOrder({
            sellerId: item.sellerId,
            orders: [
              {
                orderId: savedOrder._id,
                userId,
                quantity: item.quantity,
                totalPrice: item.itemTotalPrice,
                productId: item.productId,
                orderStatus: status,
              },
            ],
          });
          await newSellerOrder.save();
        } else {
          sellerOrder.orders.push({
            orderId: savedOrder._id,
            userId,
            quantity: item.quantity,
            totalPrice: item.itemTotalPrice,
            productId: item.productId,
            orderStatus: status,
          });
          await sellerOrder.save();
        }
      })
    );

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get orders for a user (My Orders)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({ userId });

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get orders for a seller
router.get('/seller/orders', authMiddleware, async (req, res) => {
  try {
    const sellerId = req.sellerId;

    if (!sellerId) {
      return res.status(401).json({ message: 'Unauthorized, seller ID not found in token' });
    }

    const orders = await Order.find();
    const sellerOrders = orders.filter(order =>
      order.items.some(item => item.sellerId.toString() === sellerId)
    );

    if (sellerOrders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this seller' });
    }

    res.status(200).json(sellerOrders);
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update the status of an order (for sellers)
router.put('/:orderId/status', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    if (!['Delivered', 'Undelivered', 'Shipped', 'Cancelled'].includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const sellerOrder = await SellerOrder.findOne({ sellerId: order.items[0].sellerId });
    if (!sellerOrder) {
      return res.status(404).json({ message: 'Seller order not found' });
    }

    sellerOrder.orders.forEach((item) => {
      if (item.orderId.toString() === orderId) {
        item.orderStatus = orderStatus;
      }
    });

    await sellerOrder.save();

    order.status = orderStatus;
    await order.save();

    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;