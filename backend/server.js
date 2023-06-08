require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 5000;
const cors = require('cors');


app.use(cors());

// MongoDB connection
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://Gaojian:Qwddjb123@testcluster0.odxpx2c.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// Middleware
app.use(express.json());

// Serve static files from the "frontend/public" directory
app.use(express.static(path.join(__dirname, '../frontend/public')));
// Serve the JavaScript and CSS files from the "src" directory inside the "frontend" folder
app.use('/src/js', express.static(path.join(__dirname, '../frontend/src/js')));
app.use('/src/css', express.static(path.join(__dirname, '../frontend/src/css')));

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);

// Start the server
app.listen(port, () => console.log(`Server is running on port ${port}`));
