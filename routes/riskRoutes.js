const express = require("express")

const router = express.Router()

const {
saveRisk
} = require("../controllers/riskController")

router.post("/save-risk", saveRisk)

module.exports = router