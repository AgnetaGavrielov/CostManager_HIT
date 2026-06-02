require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const pinoHttp = require('pino-http');
const Cost = require('./models/Cost');
const Report = require('./models/Report');
const Log = require('./models/Log');
// Importing the User model to validate user existence before adding costs
const User = require('./models/User');

const app = express();

/**
 * Custom Pino log stream.
 * Writes every HTTP request log to stdout and saves it to MongoDB.
 */
const logStream = {
    write: (chunk) => {
        process.stdout.write(chunk);
        try {
            const logData = JSON.parse(chunk.toString());
            // Save log to MongoDB if it contains request data
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

// Middleware to parse JSON bodies
app.use(express.json());
// Apply the Pino HTTP logger with our custom stream
app.use(pinoHttp({}, logStream));
// Connect to MongoDB Atlas using the environment variable
mongoose.connect(process.env.MONGO_URI);

const categories = ['food', 'health', 'housing', 'sports', 'education'];

/**
 * Creates an empty report structure with all five categories.
 * @param {number} userid - The ID of the user.
 * @param {number} year - The report year.
 * @param {number} month - The report month.
 * @returns {Object} An empty report object with all categories.
 */
function createEmptyReport(userid, year, month) {
    return {
        userid,
        year,
        month,
        costs: categories.map(category => ({
            [category]: []
        }))
    };
}

/**
 * POST /api/add
 * Adds a new cost item after validating the user exists and sum is not negative.
 */
app.post('/api/add', async (req, res) => {
    try {
        // Validation check - ensuring the user actually exists in the system
        const userExists = await User.findOne({ id: req.body.userid });
        if (!userExists) {
            return res.status(400).json({ id: 'validation_error', message: 'User does not exist' });
        }
        // Validation check - cost sum cannot be a negative number
        if (req.body.sum < 0) {
            return res.status(400).json({ id: 'validation_error', message: 'cost cannot be negative number' });
        }
        // Create and save the new cost document
        const cost = new Cost(req.body);
        await cost.save();
        // Return the saved cost item
        res.json(cost);
    } catch (error) {
        res.status(500).json({ id: 1, message: error.message });
    }
});

/*
 * COMPUTED DESIGN PATTERN
 * When a report for a past month is requested, it is calculated once and stored.
 * Subsequent requests for the same month return the cached result directly.
 */

/**
 * GET /api/report
 * Returns the monthly cost report for a specific user, year, and month.
 */
app.get('/api/report', async (req, res) => {
    try {
        const userid = Number(req.query.id);
        const year = Number(req.query.year);
        const month = Number(req.query.month);

        // Step 1: Search for the computed report in the database
        const existingReport = await Report.findOne({ userid, year, month });
        // Return the cached report if it already exists
        if (existingReport) {
            return res.json(existingReport.report);
        }

        // Step 2: Define the date range for fetching costs
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);
        // Fetch the costs for the specified user and date range
        const costs = await Cost.find({
            userid,
            created_at: { $gte: startDate, $lt: endDate }
        });

        // Step 3: Organize the costs into the standard report structure
        const report = createEmptyReport(userid, year, month);
        // Push each cost into its corresponding category array
        costs.forEach(cost => {
            const categoryObject = report.costs.find(
                item => item[cost.category] !== undefined
            );
            categoryObject[cost.category].push({
                sum: cost.sum,
                description: cost.description,
                day: new Date(cost.created_at).getDate()
            });
        });

        const now = new Date();
        // Step 4: If the report belongs to a past month, save it (Computed Pattern)
        if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
            const savedReport = new Report({ userid, year, month, report });
            await savedReport.save();
        }
        // Return the newly generated report
        res.json(report);
    } catch (error) {
        res.status(500).json({ id: 2, message: error.message });
    }
});

// Start the server on the defined port
const PORT = process.env.COST_PORT || 3003;
app.listen(PORT, () => {
    console.log(`Costs service running on port ${PORT}`);
});