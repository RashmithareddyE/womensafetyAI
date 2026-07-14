const express = require("express")

const router = express.Router()

const {
startTravel,
shareLocation,
sendSOS
} = require("../controllers/travelController")

router.post("/travel-start", startTravel)

router.post("/share-location", shareLocation)

router.post("/sos", sendSOS)

module.exports = router