// Importing the Mongoose library to interact with MongoDB
const mongoose = require('mongoose');

// Defining the schema for the Reports collection
// This supports the Computed Design Pattern by storing past reports
const reportSchema = new mongoose.Schema({
    userid: Number,
    year: Number,
    month: Number,
    report: Object
});

// Exporting the Report model — PascalCase as required by naming conventions
module.exports = mongoose.model('Report', reportSchema);