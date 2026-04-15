const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. FIXED CORS: This allows your frontend to communicate with the backend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/logs',   require('./routes/logs'));
app.use('/api/ai',     require('./routes/ai'));

// Health check to verify connection easily
app.get('/api/health', (req, res) => res.json({ status: 'ok', serverTime: new Date() }));

const PORT = process.env.PORT || 5000;

// 2. FIXED BINDING: Using '0.0.0.0' ensures it works on your local network/Lucknow internship setup
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Backend ready on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });