const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const helmet = require('helmet');
const session = require('express-session');
const path = require('path');
const cors = require('cors'); // Add CORS middleware

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Log environment variables for debugging
console.log('Environment variables loaded:', {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI ? '[REDACTED]' : 'undefined',
    SESSION_SECRET: process.env.SESSION_SECRET ? '[REDACTED]' : 'undefined'
});

// CORS middleware to allow client-server communication
app.use(cors({
    origin: 'http://localhost:3000', // Adjust based on your client URL (e.g., if your frontend is on a different port)
    credentials: true // Allow cookies/session data to be sent
}));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key', // Use SESSION_SECRET from .env
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true in production with HTTPS
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());

// Check if MONGO_URI is defined
if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not defined in .env file');
    process.exit(1);
}

// MongoDB connection with detailed event logging
mongoose.connection.on('connecting', () => console.log('MongoDB: Connecting...'));
mongoose.connection.on('connected', () => console.log('MongoDB: Connected successfully'));
mongoose.connection.on('disconnected', () => console.log('MongoDB: Disconnected'));
mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err));

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000 // Increased timeout to 10 seconds for better reliability
})
    .then(() => console.log('MongoDB connection established'))
    .catch(err => {
        console.error('MongoDB connection failed:', {
            message: err.message,
            stack: err.stack,
            name: err.name
        });
        process.exit(1);
    });

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    companyName: { type: String }
});
const User = mongoose.model('User', userSchema);

// Registration
app.post('/api/register', async (req, res) => {
    const { email, password, firstName, lastName, companyName } = req.body;
    console.log('Register request received:', { email, firstName, lastName, companyName }); // Log incoming data
    try {
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = new User({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            companyName
        });
        await user.save();
        console.log('User registered successfully:', { email }); // Log success
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        req.session.userId = user._id;
        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Login error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Dashboard route
app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Please log in');
    }
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// User data
app.get('/api/user', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not logged in' });
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            companyName: user.companyName
        });
    } catch (error) {
        console.error('User data error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed', error: err.message });
        }
        res.status(200).json({ message: 'Logout successful' });
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));