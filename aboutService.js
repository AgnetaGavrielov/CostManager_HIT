require('dotenv').config();
const express = require('express');

/*
 * Importing pino-http for logging all HTTP requests.
 * This is a requirement for every microservice in the project.
 */
const pino = require('pino-http')();

const app = express();

/*
 * Middleware to parse JSON and log requests.
 */
app.use(express.json());
app.use(pino);

/*
 * GET /api/about endpoint.
 * Returns a JSON document with the team members' names.
 * These names are hardcoded as they shouldn't be stored in the database.
 */
app.get('/api/about', (req, res) => {
    try {
        const teamMembers = [
            { first_name: "שם_שלך", last_name: "משפחה_שלך" },
            { first_name: "שם_שותפה", last_name: "משפחה_שותפה" }
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