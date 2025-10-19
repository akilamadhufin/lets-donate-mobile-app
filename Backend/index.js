const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const nodemailer = require('nodemailer');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const methodOverride = require('method-override'); // for put method
const dns = require('dns');


dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: false}));
app.use(express.json()); // Parse JSON bodies for API requests

app.use(methodOverride('_method'));


// sessions for logins
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// for passport
app.use(passport.initialize());
app.use(passport.session());

// user session is available for handlbars
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// multer for save images, Images are saved in uploads folder, then the url string will be saved to mongodb
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const dbURI = 'mongodb+srv://'+process.env.DBUSERNAME+':'+process.env.DBPASSWORD+'@'+process.env.CLUSTER+'.mongodb.net/'+process.env.DB+'?retryWrites=true&w=majority&appName='+process.env.CLUSTER;
console.log(dbURI);

// this is promise function
mongoose.connect(dbURI)
// if it connects do the below
.then ((result)=>
    {

        console.log('Connected to db');
    })
    // if does not connect, do the below
    .catch((err)=>{
        console.log(err);
    });
    // we need schema to make the structure of our document


//loading the schema

const User = require('./models/Users');
const Donation = require('./models/Donations');
const Cart = require('./models/Cart');
const { title } = require('process');

// passport configuration
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: 'Incorrect email.' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return done(null, false, { message: 'Incorrect password.' });

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});


app.get('/api/users/:id', async(req,res) =>{
    const id = req.params.id;
    const users = await User.findById(id);
    res.json(users);
})


  //user registration

// POST to create new user
app.post('/users',
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters'),
    body('firstname').notEmpty().withMessage('First name is required'),
    body('lastname').notEmpty().withMessage('Last name is required'),
    body('contactnumber').notEmpty().withMessage('Contact number is required'),
    body('address').notEmpty().withMessage('Address is required'),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
                data: req.body
            });
        }

        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const newUser = new User({
                ...req.body,
                password: hashedPassword
            });
            await newUser.save();

            // Auto-login after registration
            req.login(newUser, (err) => {
                if (err) {
                    console.error('Login error:', err);
                    return res.status(500).json({
                        success: false,
                        error: 'Login failed after registration',
                        data: req.body
                    });
                }
                req.session.user = newUser;
                return res.redirect('/');
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                error: 'Registration failed',
                data: req.body
            });
        }
    }
);


// login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = user;
            // For API/mobile, return user details as JSON
            return res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Something went wrong' });
    }
});


// Handle donation form submission
app.post('/donate', upload.array('image', 5), async (req, res) => {
        console.log('POST /donate req.body:', req.body);
        // Get userId from request body (mobile/API only)
        const userId = req.body.userId;
        console.log('Resolved userId:', userId);
        // Check for userId before using it
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }
    try {
        const imagePaths = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];
        const newDonationData = {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            street: req.body.street,
            city: req.body.city,
            state: req.body.state,
            postalCode: req.body.postalCode,
            country: req.body.country,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            image: imagePaths,
            userId: userId,
        };

        const newDonation = new Donation(newDonationData);
        await newDonation.save();

        // Optionally send email if session user exists
        if (userId) {
            const user = await User.findById(userId);
            if (user && user.email) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Donation Confirmation',
                text: `Dear ${user.firstname},\n\nThank you for your donation! Here are the details of your donation:\n\nTitle: ${req.body.title}\nDescription: ${req.body.description}\nCategory: ${req.body.category}\nPickup Location: ${req.body.pickupLocation}\n\nThank you for your generosity!\n\nBest regards,\nThe Let's Donate Team`
            };
            await transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error('Error sending email:', err);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
        }
    }

        // If request is from mobile/API, return JSON
        req.headers['accept'] && req.headers['accept'].includes('application/json')
            return res.status(201).json({ success: true, donation: newDonation });
        
    } catch (error) {
        console.error(error);
        // res.status(500).json({ error: 'Something went wrong' });
        return res.status(500).json({ error: 'Something went wrong' });
    }
});


//home
app.get('/', async(req, res) => {
    try {
        const allItems = await Donation.find();
            res.json({
                success: true,
                title: 'All Donated Items',
                data: allItems.map(item => item.toJSON())
            });
    } catch (error) {
        console.log(error);
            res.status(500).json({ success: false, message: 'Failed to fetch items' });
    }
});

//API endpoint for donations
app.get('/api/donations', async(req, res) => {
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

// API endpoint to book an item (add to cart)
app.post('/api/cart/book', async (req, res) => {
    try {
        const { userId, itemId } = req.body;

        if (!userId || !itemId) {
            return res.status(400).json({ 
                success: false, 
                message: 'userId and itemId are required' 
            });
        }

        const donation = await Donation.findById(itemId);

        if (!donation) {
            return res.status(404).json({ 
                success: false, 
                message: 'Item not found' 
            });
        }

        if (!donation.available) {
            return res.status(400).json({ 
                success: false, 
                message: 'Item already booked' 
            });
        }

        // Update the donation
        donation.available = false;
        donation.bookedBy = userId;
        await donation.save();

        // Create a Cart entry
        const cartEntry = await Cart.create({
            userId: userId,
            itemId: donation._id
        });

        res.json({ 
            success: true, 
            message: 'Item booked successfully',
            data: cartEntry
        });
    } catch (error) {
        console.error('Error booking item:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Something went wrong' 
        });
    }
});

// API endpoint to get user's cart/basket items
app.get('/api/cart/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const cartItems = await Cart.find({ userId })
            .populate({
                path: 'itemId',
                populate: { path: 'userId', select: 'firstname lastname email' }
            })
            .lean();

        res.json({ 
            success: true, 
            data: cartItems 
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch cart items' 
        });
    }
});

// API endpoint to remove item from cart
app.delete('/api/cart/:userId/:itemId', async (req, res) => {
    try {
        const { userId, itemId } = req.params;

        // Remove the cart entry
        await Cart.findOneAndDelete({
            userId: userId,
            itemId: itemId 
        });

        // Update donation availability
        await Donation.findByIdAndUpdate(itemId, {
            available: true,
            bookedBy: null
        });

        res.json({ 
            success: true, 
            message: 'Item removed from cart' 
        });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to remove item from cart' 
        });
    }
});

// API endpoint to get user's donations
app.get('/api/mydonations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'userId is required' 
            });
        }

        const donations = await Donation.find({ userId: userId })
            .populate('bookedBy', 'firstname lastname email')
            .lean();

        res.json({ 
            success: true, 
            data: donations 
        });
    } catch (error) {
        console.error('Error fetching user donations:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch donations' 
        });
    }
});

// API endpoint to delete a donation
app.delete('/api/donations/:donationId', async (req, res) => {
    try {
        const { donationId } = req.params;

        const donation = await Donation.findByIdAndDelete(donationId);

        if (!donation) {
            return res.status(404).json({ 
                success: false, 
                message: 'Donation not found' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Donation deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting donation:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete donation' 
        });
    }
});

// API endpoint to get user details
app.get('/api/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'userId is required' 
            });
        }

        const user = await User.findById(userId).select('-password').lean();

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({ 
            success: true, 
            data: user 
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch user details' 
        });
    }
});

// API endpoint to update user account
app.put('/api/users/:userId/update', async (req, res) => {
    try {
        const { userId } = req.params;
        const { firstname, lastname, email, contactnumber, address, password } = req.body;

        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'userId is required' 
            });
        }

        // Find user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Update fields
        if (firstname) user.firstname = firstname;
        if (lastname) user.lastname = lastname;
        if (email) user.email = email;
        if (contactnumber) user.contactnumber = contactnumber;
        if (address) user.address = address;

        // Update password if provided
        if (password && password.length > 0) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        await user.save();

        // Return updated user without password
        const updatedUser = user.toObject();
        delete updatedUser.password;

        res.json({ 
            success: true, 
            message: 'Account updated successfully',
            data: updatedUser 
        });
    } catch (error) {
        console.error('Error updating user account:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update account' 
        });
    }
});

// API endpoint to update donation
app.put('/api/donations/:donationId/update', upload.array('images', 10), async (req, res) => {
    try {
        const { donationId } = req.params;
        const { 
            title, 
            description, 
            category, 
            street, 
            city, 
            state, 
            postalCode, 
            country, 
            latitude, 
            longitude, 
            existingImages 
        } = req.body;

        if (!donationId) {
            return res.status(400).json({ 
                success: false, 
                message: 'donationId is required' 
            });
        }

        // Find donation
        const donation = await Donation.findById(donationId);

        if (!donation) {
            return res.status(404).json({ 
                success: false, 
                message: 'Donation not found' 
            });
        }

        // Update fields
        if (title) donation.title = title;
        if (description) donation.description = description;
        if (category) donation.category = category;
        if (street) donation.street = street;
        if (city) donation.city = city;
        if (state) donation.state = state;
        if (postalCode) donation.postalCode = postalCode;
        if (country) donation.country = country;
        if (latitude) donation.latitude = parseFloat(latitude);
        if (longitude) donation.longitude = parseFloat(longitude);

        // Handle images
        let imagePaths = [];
        
        // Keep existing images that weren't removed
        if (existingImages) {
            try {
                const parsedExisting = JSON.parse(existingImages);
                imagePaths = Array.isArray(parsedExisting) ? parsedExisting : [];
            } catch {
                imagePaths = [];
            }
        }

        // Add new images
        if (req.files && req.files.length > 0) {
            const newImagePaths = req.files.map(file => `/uploads/${file.filename}`);
            imagePaths = [...imagePaths, ...newImagePaths];
        }

        donation.image = imagePaths;

        await donation.save();

        res.json({ 
            success: true, 
            message: 'Donation updated successfully',
            data: donation 
        });
    } catch (error) {
        console.error('Error updating donation:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update donation' 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("listening on "+ PORT));