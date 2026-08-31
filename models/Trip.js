const mongoose = require("mongoose")

const tripSchema = new mongoose.Schema({
    event: String,
    date: String,
    day: String,
    time: String,
    lat: Number,
    lon: Number,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model("Trip", tripSchema)
