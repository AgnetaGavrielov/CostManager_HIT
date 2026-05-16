require('dotenv').config();
const express = require('express');

/*
 * Importing pino-http for logging all HTTP requests.
 * This is a requirement for every microservice in the project.
 */
const pinoHttp = require('pino-http');
const mongoose = require('mongoose');
const Log = require('./models/log');

const app = express();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('About Service connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

const logStream = {
    write: (chunk) => {
        process.stdout.write(chunk);
        try {
            const logData = JSON.parse(chunk.toString());
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
 * Middleware to parse JSON and log requests.
 */
app.use(express.json());
app.use(pinoHttp({}, logStream));

/*
 * GET /api/about endpoint.
 * Returns a JSON document with the team members' names.
 * These names are hardcoded as they shouldn't be stored in the database.
 */
app.get('/api/about', (req, res) => {
    try {
        const teamMembers = [
            { first_name: "שם_שלך", last_name: "משפחה_שלך" },
            { first_name: "tal", last_name: "sujaz" }
        ];

        // Send the JSON response with status 200
        res.status(200).json(teamMembers);

    } catch (error) {
        /*
         * Error handling: returning the required JSON format.
         */
        res.status(400).json({
            id: "about_error",
            message: error.message
        });
    }
});

/*
 * Starting the About service on port 3002.
 * Each process must run on a different port.
 */
const PORT = process.env.ABOUT_PORT || 3002;
app.listen(PORT, () => {
    console.log(`About service is running on port ${PORT}`);
});