const RiskAlert = require("../models/RiskAlert")

const fs = require("fs")
const extractFeatures = require("../services/featureExtractor")
const calculateRisk = require("../services/riskEngine")

const AI_PREDICTION_FILE = "./data/aiPredictions.json"

/* SAVE RISK */
async function saveRisk(req, res) {

    try {

        const { message } = req.body

        await RiskAlert.create({

            message,
            time: new Date().toLocaleString()

        })

        res.send("risk saved")

    }

    catch(err){

        console.error(err)

        res.status(500).send("error")

    }

}

/* CALCULATE AI RISK */
async function calculateAIRisk(req, res) {

    try {

        const features = await extractFeatures(req)

        const result = calculateRisk(features)

        let history = []

        if (fs.existsSync(AI_PREDICTION_FILE)) {

            history = JSON.parse(
                fs.readFileSync(AI_PREDICTION_FILE, "utf8")
            )

        }

        history.push({

            time: new Date().toLocaleString(),

            features,

            prediction: result

        })

        fs.writeFileSync(

            AI_PREDICTION_FILE,

            JSON.stringify(history, null, 2)

        )

        res.json({

            success: true,

            features,

            risk: result

        })

    }

    catch(err){

        console.error(err)

        res.status(500).json({

            success:false,

            message:err.message

        })

    }

}

module.exports={

saveRisk,
calculateAIRisk

}