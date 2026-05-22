require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

/*
 * Importing pino-http for professional logging of all requests.
 * Importing the User model from the local models folder.
 */
const pinoHttp = require('pino-http');
const User = require('./models/User');
const Cost = require('./models/cost');
const Log = require('./models/log');

const app = express();

/*
 * Custom Pino stream that writes to console and saves Log documents.
 */
const logStream = {
    write: (chunk) => {
        process.stdout.write(chunk);
        try {
            const logData = JSON.parse(chunk.toString());
            // Save log entry to MongoDB if the chunk contains request data
            if (logData.req) {
                Log.create({
                    method: logData.req.method,
                    url: logData.req.url,
                    timestamp: logData.time ? new Date(logData.time) : new Date()
                }).catch(() => {});
            }
        } catch (e) {}
    }
};

/*
 * Standard middleware for parsing JSON in request bodies.
 * Pino middleware logs every incoming HTTP request automatically.
 */
app.use(express.json());
app.use(pinoHttp({}, logStream));

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

        // Validating that all required fields are present before proceeding
        if (!id || !first_name || !last_name || !birthday) {
            return res.status(400).json({
                id: id || 'unknown',
                message: 'Missing required fields: id, first_name, last_name, birthday'
            });
        }

        /*
         * Initializing a new User document based on the Mongoose schema.
         * Saving the document to the database asynchronously.
         */
        const newUser = new User({ id, first_name, last_name, birthday });
        const savedUser = await newUser.save();

        // Returning 201 status and the saved document upon success
        res.status(201).json(savedUser);
    } catch (error) {
        // Handling duplicate user error specifically (MongoDB error code 11000)
        if (error.code === 11000) {
            return res.status(400).json({
                id: req.body ? req.body.id : 'unknown',
                message: 'User already exists'
            });
        }

        /*
         * Standardized error response containing id and message.
         * Status 400 is used for bad requests or validation errors.
         */
        res.status(400).json({
            id: req.body ? req.body.id : 'unknown',
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
        // Returning the full list of users with status 200
        res.status(200).json(users);
    } catch (error) {
        // Handling unexpected database errors during fetch
        res.status(400).json({
            id: 'all_users_error',
            message: error.message
        });
    }
});

/*
 * GET /api/users/:id endpoint for specific user details.
 * Converts the URL param to Number to match the schema type.
 */
app.get('/api/users/:id', async (req, res) => {
    try {
        // Converting the string param to a Number to match the schema type
        const userId = Number(req.params.id);

        // Validating that the provided ID is actually a valid number
        if (isNaN(userId)) {
            return res.status(400).json({
                id: req.params.id,
                message: 'Invalid user ID format'
            });
        }

        const user = await User.findOne({ id: userId });

        /*
         * Checking if the user exists in the database.
         * Returning 404 Not Found if user is missing.
         */
        if (!user) {
            return res.status(404).json({
                id: userId,
                message: 'User not found'
            });
        }

        // Calculating the total costs for this user across all categories
        const userCosts = await Cost.find({ userid: userId });
        const total = userCosts.reduce((acc, current) => acc + current.sum, 0);

        /*
         * Success response including basic info and calculated total costs.
         */
        res.status(200).json({
            first_name: user.first_name,
            last_name: user.last_name,
            id: user.id,
            total: total
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