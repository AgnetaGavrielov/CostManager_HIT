require('dotenv').config();

const express = require('express');
// Importing pino-http for logging all HTTP requests
// This is a requirement for every microservice in the project
const pinoHttp = require('pino-http');
const mongoose = require('mongoose');
const Log = require('./models/Log');

const app = express();

// Connect to MongoDB so logs can be saved from this service
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('About Service connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

/**
 * Custom Pino stream that writes to stdout and saves logs to MongoDB.
 */
const logStream = {
    write: (chunk) => {
        process.stdout.write(chunk);
        try {
            const logData = JSON.parse(chunk.toString());
            // Save log entry if request data is present
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

// Middleware to parse JSON and log all requests
app.use(express.json());
app.use(pinoHttp({}, logStream));

/**
 * GET /api/about
 * Returns the team members' first and last names.
 * Names are hardcoded and must not be stored in the database.
 */
app.get('/api/about', (req, res) => {
    try {
        // Team members are hardcoded as required by the project specification
        const teamMembers = [
            { first_name: 'agneta', last_name: 'gavrielov' },
            { first_name: 'tal', last_name: 'sujaz' }
        ];
        // Send the JSON response with status 200
        res.status(200).json(teamMembers);
    } catch (error) {
        res.status(400).json({
            id: 'about_error',
            message: error.message
        });
    }
});

// Starting the About service on the defined port
const PORT = process.env.ABOUT_PORT || 3002;
app.listen(PORT, () => {
    console.log(`About service is running on port ${PORT}`);
});