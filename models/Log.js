/*
 * Importing the Mongoose library.
 */
const mongoose = require('mongoose');

/*
 * Defining the schema for the Logs collection.
 * This collection stores every HTTP request made to the system.
 */
const logSchema = new mongoose.Schema({
    method: String,
    url: String,
    timestamp: {
        type: Date,
        default: Date.now // Automatically sets the current date and time
    }
});

/*
 * Exporting the Log model to be used by the services.
 * The model name starts with a capital letter as required.
 */
module.exports = mongoose.model('Log', logSchema);