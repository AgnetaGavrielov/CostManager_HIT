require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

/*
 * Importing pino-http for professional logging of all requests.
 * Importing the User model from the local models folder.
 */
const pino = require('pino-http')();
const User = require('./models/User');

const app = express();

/*
 * Standard middleware for parsing JSON in request bodies.
 * Pino middleware logs every incoming HTTP request automatically.
 */
app.use(express.json());
app.use(pino);

/*
 * Establishing connection to MongoDB Atlas using the URI from .env.
 * Handling success and failure scenarios for the database connection.
 */
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB successfully!'))
    .catch((error) => console.error('MongoDB connection error:', error));

/*
 * POST /api/add endpoint for creating new users.
 * Expects id, first_name, last_name, and birthday in the JSON body.
 */
app.post('/api/add', async (req, res) => {
    try {
        const { id, first_name, last_name, birthday } = req.body;

        /*
         * Initializing a new User document based on the Mongoose schema.
         * Saving the document to the database asynchronously.
         */
        const newUser = new User({ id, first_name, last_name, birthday });
        const savedUser = await newUser.save();

        // Returning 201 status and the saved document upon success
        res.status(201).json(savedUser);

    } catch (error) {
        /*
         * Standardized error response containing id and message.
         * Status 400 is used for bad requests or validation errors.
         */
        res.status(400).json({
            id: req.body ? req.body.id : "unknown",
            message: error.message
        });
    }
});

/*
 * GET /api/users endpoint to retrieve all registered users.
 * Fetches every document from the users collection.
 */
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        /*
         * Handling unexpected database errors during fetch.
         */
        res.status(400).json({
            id: "all_users_error",
            message: error.message
        });
    }
});

/*
 * GET /api/users/:id endpoint for specific user details.
 * Also returns the total costs sum (set to 0 until partner completes costs).
 */
app.get('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findOne({ id: userId });

        /*
         * Checking if the user exists in the database.
         * Returning 404 Not Found if user is missing.
         */
        if (!user) {
            return res.status(404).json({
                id: userId,
                message: "User not found"
            });
        }

        /*
         * Success response including basic info and total costs placeholder.
         * Partner will integrate this with the costs collection later.
         */
        res.status(200).json({
            first_name: user.first_name,
            last_name: user.last_name,
            id: user.id,
            total: 0
        });

    } catch (error) {
        res.status(400).json({
            id: req.params.id,
            message: error.message
        });
    }
});

/*
 * Initializing the server on the specified port from environment variables.
 * Each process in this project runs as a separate microservice.
 */
const PORT = process.env.USERS_PORT || 3001;
app.listen(PORT, () => {
    console.log(`Users service is running on port ${PORT}`);
});