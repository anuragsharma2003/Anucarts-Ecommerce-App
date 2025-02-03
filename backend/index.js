const path = require('path'); // Ensure path module is required
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');  // Import orders routes

const app = express();
const port = process.env.PORT;

// CORS options
const corsOptions = {
  origin: '*', // Allow requests from all origins (use specific origins in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allow these HTTP methods (added PATCH for order updates)
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
};

// Middleware
app.use(cors(corsOptions)); // Apply CORS options
app.use(bodyParser.json());

// MongoDB Atlas Connection String
const uri = process.env.MONGO_URI;

// Connect to MongoDB Atlas
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Atlas connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Define Routes
app.use('/user', userRoutes);
app.use('/seller', sellerRoutes);
app.use('/product', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);  // Register the orders route

// Define a basic route
app.get('/', (req, res) => {
  res.send('Welcome to the Anucarts backend server!');
});

// Error handling for unsupported routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${port}`);
  console.log(`Expose your local server using ngrok for public access`);
});