const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const Seller = require('../models/Seller');

// Secret for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Seller Signup Route
router.post('/signup', async (req, res) => {
  try {
    const { name, companyName, email, password } = req.body;

    // Validate input fields
    if (!name || !companyName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ message: 'Seller with this email already exists' });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new Seller instance
    const newSeller = new Seller({
      name,
      companyName,
      email,
      password: hashedPassword,
    });

    // Save the new seller to the database
    await newSeller.save();

    res.status(201).json({ message: 'Seller account created successfully' });
  } catch (error) {
    console.error('Error during Seller signup:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Seller Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the seller by email
    const seller = await Seller.findOne({ email });
    if (!seller || !(await bcrypt.compare(password, seller.password))) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ sellerId: seller._id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Seller login successful',
      token,
      sellerId: seller._id,
    });
  } catch (error) {
    console.error('Error during Seller login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Middleware to authenticate JWT token
const authenticateSeller = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'No token provided or invalid format' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.sellerId = decoded.sellerId;
    next();
  } catch (error) {
    console.error('JWT Error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Fetch Seller Homepage Information
router.get('/home', authenticateSeller, async (req, res) => {
  try {
    const seller = await Seller.findById(req.sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    res.status(200).json({
      name: seller.name,
      companyName: seller.companyName,
      email: seller.email,
    });
  } catch (error) {
    console.error('Error fetching seller information:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;