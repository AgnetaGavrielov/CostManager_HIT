// Importing the Mongoose library
const mongoose = require('mongoose');

// Defining the schema for the Users collection
// The required fields are id, first_name, last_name, and birthday
const userSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true // Prevents duplicate users in the database
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    // Birthday field is required by the project documentation
    birthday: {
        type: Date,
        required: true
    }
});

// Creating and exporting the User model — PascalCase as required
const User = mongoose.model('User', userSchema);
module.exports = User;