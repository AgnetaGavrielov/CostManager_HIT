
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    userid: Number,
    year: Number,
    month: Number,
    report: Object
});

module.exports = mongoose.model('Report', reportSchema);
