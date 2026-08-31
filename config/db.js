const mongoose = require("mongoose")

async function connectDB() {

    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/womenSafetyDB"

    try {

        await mongoose.connect(uri)

        console.log("MongoDB Connected")

    }

    catch (error) {

        console.error("MongoDB connection error:", error.message)

        process.exit(1)

    }

}

module.exports = connectDB
