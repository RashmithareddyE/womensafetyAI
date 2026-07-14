const mongoose = require("mongoose")

const tripSchema = new mongoose.Schema({
    event: String,
    date: String,
    day: String,
    time: String,
    lat: Number,
    lon: Number
})

module.exports = mongoose.model("Trip", tripSchema)