const mongoose = require("mongoose")

const contactSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model("Contact", contactSchema)
