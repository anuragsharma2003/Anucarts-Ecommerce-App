const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product'); // Assuming Product model exists and has the image field
const verifyToken = require('../middlewares/authMiddleware'); // Middleware to authenticate
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // Import Cloudinary Storage
const multer = require('multer');
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage using Cloudinary for image uploads (for product images, if needed in cart)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'anucarts_cart_images', // Cloudinary folder for cart item images
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const upload = multer({ storage });

// Get all cart items for the authenticated user
router.get('/', verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId }).populate('items.productId');
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    // Map cart items to include product details (like image from Cloudinary)
    const cartItemsWithImages = cart.items.map(item => {
      return {
        ...item._doc,
        productId: {
          ...item.productId._doc,
          image: item.productId.image, // Ensure image URL is taken from Cloudinary
        },
      };
    });

    res.json({ items: cartItemsWithImages });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add an item to the authenticated user's cart
router.post('/', verifyToken, async (req, res) => {
  const { productId, name, price, quantity } = req.body;

  try {
    // Get product details (including seller)
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const sellerId = product.seller; // ✅ Correctly fetching sellerId

    // Find or create the cart for the logged-in user
    let cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [] });
    }

    // Check if the item already exists in the cart
    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity; // Update quantity if item already exists
    } else {
      // Add new item to the cart with sellerId
      cart.items.push({
        productId,
        name,
        price,
        quantity,
        sellerId,  // ✅ Fixed: Using correct field
        image: product.image // Cloudinary URL for product image
      });
    }
    // Save the updated cart
    await cart.save();
    res.status(201).json(cart); // Send the updated cart as the response
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove an item from the authenticated user's cart
router.delete('/:productId', verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId);
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update the quantity of an item in the authenticated user's cart
router.put('/:productId', verifyToken, async (req, res) => {
  const { quantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(item => item.productId.toString() === req.params.productId);
    if (item) {
      item.quantity = quantity;
      await cart.save();
      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;