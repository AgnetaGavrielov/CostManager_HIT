const mongoose = require('mongoose');

/*
 * Defining the schema for the Users collection.
 * The required fields are id, first_name, last_name, and birthday.
 */
const userSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
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