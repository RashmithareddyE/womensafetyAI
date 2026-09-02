const mongoose = require("mongoose")

const tripSchema = new mongoose.Schema({
    event: String,
    date: String,
    day: String,
    time: String,
    lat: Number,
    lon: Number,
    accuracy: Number,
    altitude: Number,
    speed: Number,
    heading: Number,

    address: {
        road: String,
        area: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,
        formatted: String
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model("Trip", tripSchema)
