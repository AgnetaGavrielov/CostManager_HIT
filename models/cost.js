
const mongoose = require('mongoose');

const costSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['food', 'health', 'housing', 'sports', 'education'],
        required: true
    },
    userid: {
        type: Number,
        required: true
    },
    sum: {
        type: Number,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Cost', costSchema);
