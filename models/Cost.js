/*
 * Importing Mongoose to define the schema and model.
 */
const mongoose = require('mongoose');

/*
 * Defining the schema for the Costs collection.
 * Includes validation for the required category enumerations.
 */
const costSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        // Ensures only valid categories are accepted according to requirements
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
        default: Date.now // Defaults to the current date if not provided
    }
});

/*
 * Exporting the Cost model.
 * The model name is PascalCase according to naming conventions.
 */
module.exports = mongoose.model('Cost', costSchema);