const mongoose = require("mongoose")

const riskSchema = new mongoose.Schema({
    message: String,
    time: String
})

module.exports = mongoose.model("RiskAlert", riskSchema)