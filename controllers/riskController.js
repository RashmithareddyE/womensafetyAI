const RiskAlert = require("../models/RiskAlert")
const RiskPrediction = require("../models/RiskPrediction")

const extractFeatures = require("../services/featureExtractor")
const calculateRisk = require("../services/riskEngine")

/* SAVE RISK (free-text situation message) */
async function saveRisk(req, res) {

    try {

        const { message } = req.body

        if (!message) {
            return res.status(400).send("A message is required")
        }

        await RiskAlert.create({

            message,
            time: new Date().toLocaleString(),
            owner: req.userId

        })

        res.send("risk saved")

    }

    catch (err) {

        console.error(err)

        res.status(500).send("error")

    }

}

/* CALCULATE AI RISK */
async function calculateAIRisk(req, res) {

    try {

        const features = await extractFeatures(req)

        const result = calculateRisk(features)

        /* tripId is optional — a prediction doesn't have to belong to a trip */
        const { tripId } = req.body

        await RiskPrediction.create({

            owner: req.userId,

            ...(tripId ? { trip: tripId } : {}),

            features,

            prediction: result

        })

        res.json({

            success: true,

            features,

            risk: result

        })

    }

    catch (err) {

        console.error(err)

        res.status(500).json({

            success: false,

            message: err.message

        })

    }

}

/* GET RISK PREDICTION HISTORY (for the authenticated user) */
async function getRiskHistory(req, res) {

    try {

        const history = await RiskPrediction
            .find({ owner: req.userId })
            .sort({ createdAt: -1 })
            .limit(100)

        res.json(history)

    }

    catch (err) {

        console.error(err)

        res.status(500).json({ message: "error" })

    }

}

module.exports = {

    saveRisk,
    calculateAIRisk,
    getRiskHistory

}
