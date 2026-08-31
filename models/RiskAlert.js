const mongoose = require("mongoose")

const riskSchema = new mongoose.Schema({
    message: String,
    time: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model("RiskAlert", riskSchema)
