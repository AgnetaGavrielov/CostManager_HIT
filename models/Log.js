// Importing the Mongoose library
const mongoose = require('mongoose');

// Defining the schema for the Logs collection
// This collection stores every HTTP request made to the system
const logSchema = new mongoose.Schema({
    method: String,
    url: String,
    timestamp: {
        type: Date,
        default: Date.now // Automatically sets the current date and time
    }
});

// Exporting the Log model — PascalCase as required by naming conventions
module.exports = mongoose.model('Log', logSchema);