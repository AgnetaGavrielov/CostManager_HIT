require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const pinoHttp = require('pino-http');
const Cost = require('./models/cost');
const Report = require('./models/report');
const Log = require('./models/log');

// Importing the User model to validate user existence before adding costs
const User = require('./models/User');

const app = express();

// Configuring the Pino log stream to save log data to the database
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

/*
 * Establishing connection to MongoDB Atlas using the URI from .env.
 * Handling success and failure scenarios for the database connection.
 */
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Cost service connected to MongoDB successfully!'))
    .catch((error) => console.error('MongoDB connection error:', error));

// Valid categories as defined in the project requirements
const categories = ['food', 'health', 'housing', 'sports', 'education'];

/*
 * Helper function to create an empty report structure with all categories.
 * Used both for fresh reports and as the base for the computed pattern.
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

/*
 * POST /api/add endpoint for adding a new cost item.
 * We must validate that the user exists in the database before saving.
 */
app.post('/api/add', async (req, res) => {
    try {
        const { userid, description, category, sum } = req.body;

        // Validating that all required fields are present
        if (!userid || !description || !category || sum === undefined) {
            return res.status(400).json({
                id: 'validation_error',
                message: 'Missing required fields: userid, description, category, sum'
            });
        }

        // Validating that the category is one of the allowed values
        if (!categories.includes(category)) {
            return res.status(400).json({
                id: 'validation_error',
                message: `Invalid category. Must be one of: ${categories.join(', ')}`
            });
        }

        // Validation check - ensuring the user actually exists in the system
        const userExists = await User.findOne({ id: Number(userid) });
        if (!userExists) {
            return res.status(400).json({
                id: 'validation_error',
                message: 'User does not exist'
            });
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
 * COMPUTED DESIGN PATTERN IMPLEMENTATION
 * This pattern saves resources by storing past months' reports in the database.
 * Upon request, we first check if the report is already calculated and saved.
 * If yes, we return it immediately. If not, we calculate it, and if it belongs
 * to a past month, we save it for future use to avoid repeated calculations.
 */
app.get('/api/report', async (req, res) => {
    try {
        // Validating that all required query parameters are present
        if (!req.query.id || !req.query.year || !req.query.month) {
            return res.status(400).json({
                id: 'validation_error',
                message: 'Missing required parameters: id, year, month'
            });
        }

        const userid = Number(req.query.id);
        const year = Number(req.query.year);
        const month = Number(req.query.month);

        // Validating that the converted values are valid numbers
        if (isNaN(userid) || isNaN(year) || isNaN(month)) {
            return res.status(400).json({
                id: 'validation_error',
                message: 'Parameters id, year, and month must be valid numbers'
            });
        }

        // Step 1: Search for the computed report in the database
        const existingReport = await Report.findOne({ userid, year, month });

        // Return the cached report if it already exists (Computed Pattern cache hit)
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
            // Only add if the category exists in our allowed list
            if (categoryObject) {
                categoryObject[cost.category].push({
                    sum: cost.sum,
                    description: cost.description,
                    day: new Date(cost.created_at).getDate()
                });
            }
        });

        const now = new Date();

        // Step 4: If the report belongs to a past month, save it (Computed Pattern cache store)
        if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
            const savedReport = new Report({ userid, year, month, report });
            await savedReport.save();
        }

        // Return the newly generated report as a plain JSON object
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