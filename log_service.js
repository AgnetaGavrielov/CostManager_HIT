require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
// Importing pino-http for logging requests
// Importing the Log model for MongoDB interactions
const pinoHttp = require('pino-http');
const Log = require('./models/Log');

const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json());
// Connecting to the MongoDB Atlas database using URI from environment variables
mongoose.connect(process.env.MONGO_URI);

/**
 * Custom stream for Pino logger.
 * Writes logs to stdout and saves each request entry into MongoDB.
 */
const logStream = {
    write: (chunk) => {
        process.stdout.write(chunk);
        try {
            const logData = JSON.parse(chunk.toString());
            // Check if the log contains request data before saving
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

// Apply the pino-http logger middleware with the custom stream
app.use(pinoHttp({}, logStream));

/**
 * GET /api/logs
 * Retrieves all log entries saved in the MongoDB database.
 */
app.get('/api/logs', async (req, res) => {
    try {
        // Fetch all logs from the MongoDB collection
        const logs = await Log.find();
        // Return the array of logs
        res.json(logs);
    } catch (error) {
        res.status(500).json({
            id: 1,
            message: error.message
        });
    }
});

// Start the logs microservice on the specified port
const PORT = process.env.LOG_PORT || 3004;
app.listen(PORT, () => {
    console.log(`Logs service running on port ${PORT}`);
});