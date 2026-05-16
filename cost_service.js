
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const pinoHttp = require('pino-http');

const Cost = require('./models/cost');
const Report = require('./models/report');
const Log = require('./models/log');

const app = express();

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

app.use(express.json());
app.use(pinoHttp({}, logStream));

mongoose.connect(process.env.MONGO_URI);

const categories = ['food', 'health', 'housing', 'sports', 'education'];

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

app.post('/api/add', async (req, res) => {
    try {
        const cost = new Cost(req.body);

        await cost.save();

        res.json(cost);
    } catch (error) {
        res.status(500).json({
            id: 1,
            message: error.message
        });
    }
});

app.get('/api/report', async (req, res) => {
    try {
        const userid = Number(req.query.id);
        const year = Number(req.query.year);
        const month = Number(req.query.month);

        const existingReport = await Report.findOne({
            userid,
            year,
            month
        });

        if (existingReport) {
            return res.json(existingReport.report);
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);

        const costs = await Cost.find({
            userid,
            created_at: {
                $gte: startDate,
                $lt: endDate
            }
        });

        const report = createEmptyReport(userid, year, month);

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

        if (
            year < now.getFullYear() ||
            (year === now.getFullYear() && month < now.getMonth() + 1)
        ) {
            const savedReport = new Report({
                userid,
                year,
                month,
                report
            });

            await savedReport.save();
        }

        res.json(report);
    } catch (error) {
        res.status(500).json({
            id: 2,
            message: error.message
        });
    }
});

const PORT = process.env.COST_PORT || 3003;
app.listen(PORT, () => {
    console.log(`Costs service running on port ${PORT}`);
});
