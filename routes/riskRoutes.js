const express = require("express")

const router = express.Router()

const {
    saveRisk,
    calculateAIRisk
} = require("../controllers/riskController")

router.post("/save-risk", saveRisk)

router.post("/calculate-risk", calculateAIRisk)

module.exports = router