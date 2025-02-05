const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const router = express.Router();
const Product = require('../models/Product');
const Seller = require('../models/Seller');
const verifyToken = require('../middlewares/authMiddleware');
 // Load environment variables

// 🔹 Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔹 Multer storage using Cloudinary
//const storage = new CloudinaryStorage({
//  cloudinary,
//  params: {
//    folder: 'anucarts_products', // Cloudinary folder
//    allowed_formats: ['jpg', 'jpeg', 'png'],
//  },
//});
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'anucarts_products',
    format: file.mimetype.split('/')[1], // Automatically detects file format
    public_id: `${Date.now()}-${file.originalname}`, // Ensures unique filenames
  }),
});



const upload = multer({ storage });

// ===================== ROUTES =====================

// 🔹 Add product
router.post('/add', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body;
    const sellerId = req.sellerId;

    if (!name || !description || !price || !quantity || !req.file) {
      return res.status(400).json({ message: 'All fields are required, including the image' });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // 🔹 Store product with Cloudinary image URL
    const newProduct = new Product({
      seller: sellerId,
      name,
      description,
      price,
      quantity,
      image: req.file.path, // Cloudinary URL
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 🔹 Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('seller', 'companyName');
    if (products.length === 0) {
      return res.status(404).json({ message: 'No products available' });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 🔹 Get products by seller
router.get('/seller', verifyToken, async (req, res) => {
  try {
    const sellerId = req.sellerId;
    const products = await Product.find({ seller: sellerId });

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found for this seller' });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 🔹 Get product details
router.get('/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;

    const product = await Product.findById(productId).populate('seller', 'name email');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product details:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 🔹 Edit product
router.put('/edit/:productId', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body;
    const productId = req.params.productId;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.sellerId) {
      return res.status(403).json({ message: 'You are not authorized to edit this product' });
    }

    // Update product details
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.quantity = quantity || product.quantity;

    // Update image if a new file is uploaded
    if (req.file) {
      product.image = req.file.path;
    }

    await product.save();
    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Error editing product:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 🔹 Delete product
router.delete('/delete/:productId', verifyToken, async (req, res) => {
  try {
    const productId = req.params.productId;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.sellerId) {
      return res.status(403).json({ message: 'You are not authorized to delete this product' });
    }

    await Product.deleteOne({ _id: productId });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;