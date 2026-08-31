const mongoose = require("mongoose")

const riskPredictionSchema = new mongoose.Schema({

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    /*
     * Optional link to the trip this prediction was made during.
     * Left unset for predictions that aren't tied to a specific trip.
     */
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip",
        required: false
    },

    features: {
        hour: Number,
        day: String,
        weather: String,
        battery: Number,
        latitude: Number,
        longitude: Number,
        areaType: String,
        policeDistance: Number,
        hospitalDistance: Number,
        crowdLevel: String
    },

    prediction: {
        score: {
            type: Number,
            required: true
        },
        reasons: [String]
    }

    /*
     * No separate string "time" field — `timestamps: true` below already
     * gives us a proper Date-typed `createdAt`, which is what analytics/ML
     * consumers should sort and filter on. Keeping both would just be two
     * sources of truth for the same moment in time.
     */

}, { timestamps: true })

/*
 * The dashboard's main read pattern is "this user's predictions, most
 * recent first" (see getRiskHistory). This compound index serves that
 * query directly instead of falling back to a full collection scan
 * with an in-memory sort.
 */
riskPredictionSchema.index({ owner: 1, createdAt: -1 })

module.exports = mongoose.model("RiskPrediction", riskPredictionSchema)
