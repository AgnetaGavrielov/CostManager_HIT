/*
 * Importing the Mongoose library.
 */
const mongoose = require('mongoose');

/*
 * Defining the schema for the Users collection.
 * The required fields are id, first_name, last_name, and birthday.
 */
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
    // Adding birthday field as required by the documentation
    birthday: {
        type: Date,
        required: true
    }
});

/*
 * Creating the User model using the schema above.
 * The model name must start with a capital letter.
 */
const User = mongoose.model('User', userSchema);

module.exports = User;