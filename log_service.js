
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const pinoHttp = require('pino-http');
const Log = require('./models/log');

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

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

app.use(pinoHttp({}, logStream));

app.get('/api/logs', async (req, res) => {
    try {
        const logs = await Log.find();

        res.json(logs);
    } catch (error) {
        res.status(500).json({
            id: 1,
            message: error.message
        });
    }
});

const PORT = process.env.LOG_PORT || 3004;
app.listen(PORT, () => {
    console.log(`Logs service running on port ${PORT}`);
});
