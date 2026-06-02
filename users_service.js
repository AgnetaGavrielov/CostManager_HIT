require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
// Importing pino-http for professional logging of all requests
// Importing models from the local models folder
const pinoHttp = require('pino-http');
const User = require('./models/User');
const Cost = require('./models/Cost');
const Log = require('./models/Log');

const app = express();

/**
 * Custom Pino stream that writes to console and saves Log documents to MongoDB.
 */
const logStream = {
    write: (chunk) => {
        process.stdout.write(chunk);
        try {
            const logData = JSON.parse(chunk.toString());
            // Save log entry to MongoDB if request data is present
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

// Standard middleware for parsing JSON in request bodies
// Pino middleware logs every incoming HTTP request automatically
app.use(express.json());
app.use(pinoHttp({}, logStream));

// Establishing connection to MongoDB Atlas using the URI from .env
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB successfully!'))
    .catch((error) => console.error('MongoDB connection error:', error));

/**
 * POST /api/add
 * Creates a new user. Validates all required fields before saving.
 * @param {number} id - Unique user ID.
 * @param {string} first_name - User's first name.
 * @param {string} last_name - User's last name.
 * @param {Date} birthday - User's date of birth.
 */
app.post('/api/add', async (req, res) => {
    try {
        const { id, first_name, last_name, birthday } = req.body;

        // Validating that all required fields are present with specific error messages
        if (id === undefined || id === null) {
            return res.status(400).json({ id: 'validation_error', message: 'id is required' });
        }
        if (!first_name) {
            return res.status(400).json({ id: 'validation_error', message: 'first_name is required' });
        }
        if (!last_name) {
            return res.status(400).json({ id: 'validation_error', message: 'last_name is required' });
        }
        if (!birthday) {
            return res.status(400).json({ id: 'validation_error', message: 'birthday is required' });
        }

        // Initializing a new User document and saving to the database
        const newUser = new User({ id, first_name, last_name, birthday });
        const savedUser = await newUser.save();
        // Returning 201 status and the saved document upon success
        res.status(201).json(savedUser);
    } catch (error) {
        // Standardized error response containing id and message
        res.status(400).json({
            id: req.body ? req.body.id : 'unknown',
            message: error.message
        });
    }
});

/**
 * GET /api/users
 * Returns a list of all registered users.
 */
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(400).json({
            id: 'all_users_error',
            message: error.message
        });
    }
});

/**
 * GET /api/users/:id
 * Returns details for a specific user including their total costs.
 * @param {string} id - The user ID passed as a URL parameter.
 */
app.get('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findOne({ id: userId });

        // Checking if the user exists in the database
        // Returning 404 Not Found if user is missing
        if (!user) {
            return res.status(404).json({
                id: userId,
                message: 'User not found'
            });
        }

        // Calculate total costs for this user and return the response
        const userCosts = await Cost.find({ userid: user.id });
        const total = userCosts.reduce((acc, current) => acc + current.sum, 0);
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

// Initializing the server on the specified port from environment variables
const PORT = process.env.USERS_PORT || 3001;
app.listen(PORT, () => {
    console.log(`Users service is running on port ${PORT}`);
});