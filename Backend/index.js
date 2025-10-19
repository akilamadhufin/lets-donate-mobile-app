const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const dns = require('dns');
const path = require('path');

dns.setServers(['8.8.8.8', '8.8.4.4']);


const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// Models
const User = require('./models/Users');
const Donation = require('./models/Donations');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());



app.use(session({
    secret: process.env.SESSION_SECRET || 'yoursecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));


// MongoDB connection
const dbURI = 'mongodb+srv://'+process.env.DBUSERNAME+':'+process.env.DBPASSWORD+'@'+process.env.CLUSTER+'.mongodb.net/'+process.env.DB+'?retryWrites=true&w=majority&appName='+process.env.CLUSTER;
mongoose.connect(dbURI)
    .then(() => console.log('Connected to db'))
    .catch((err) => console.log(err));


// --- LOGIN ---

// Render login page
app.get('/login', (req, res) => {
    res.json({ message: 'Login endpoint' });
});

// Handle login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = user;
            if (user.isAdmin) {
                return res.redirect('/admin');
            }
            res.redirect('/');
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ success: true });
    });
});

// --- REGISTRATION ---

// Render registration page
app.get('/user-registration', (req, res) => {
    res.json({ message: 'User Registration endpoint' });
});

// Handle registration
app.post('/users',
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters'),
    body('firstname').notEmpty().withMessage('First name is required'),
    body('lastname').notEmpty().withMessage('Last name is required'),
    body('contactnumber').notEmpty().withMessage('Contact number is required'),
    body('address').notEmpty().withMessage('Address is required'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), ...req.body });
        }
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const newUser = new User({
                ...req.body,
                password: hashedPassword
            });
            await newUser.save();
            req.session.user = newUser;
            return res.status(201).json({ success: true, user: newUser });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Registration failed', ...req.body });
        }
    }
);


// HOMESCREEN all donations
app.get('/api/donations', async (req, res) => {
    try {
        const allItems = await Donation.find();
        res.json({
            success: true,
            title: 'All Donated Items',
            data: allItems.map(item => item.toJSON())
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch items' 
        });
    }
});


// get all users (for registration testing)
app.get('/api/users', async (req, res) => {
    try {
        const result = await User.find();
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
});



//home
app.get('/', async(req, res) => {
    try {
        const allItems = await Donation.find();
        res.json({
            title: 'All Donated Items',
            allItems: allItems.map(item => item.toJSON())
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch items' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("listening on " + PORT));