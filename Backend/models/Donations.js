const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const donationSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: Schema.Types.Mixed, // Allow both String and Array
        required: false
    },
    pickupLocation: {
        type: String,
        required: false // Make optional to support legacy data
    },
    publishedDate: {
        type: Date,
        default: Date.now
    },
    available: {
        type: Boolean,
        default: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    },
    bookedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }

});

const Donations = mongoose.model('Donation', donationSchema);

module.exports = Donations;
