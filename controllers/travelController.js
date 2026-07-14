const fs = require("fs")

const TRAVEL_FILE = "./data/travel.json"

function getTimeData(event, lat, lon) {

const now = new Date()

return {

event: event,
date: now.toLocaleDateString(),
day: now.toLocaleString("en-US", { weekday: "long" }),
time: now.toLocaleTimeString(),
lat: lat,
lon: lon

}

}

/* TRAVEL START */
function startTravel(req, res) {

const { lat, lon } = req.body

let travel = JSON.parse(
fs.readFileSync(TRAVEL_FILE, "utf8") || "[]"
)

travel.push(getTimeData("TRAVEL_START", lat, lon))

fs.writeFileSync(
TRAVEL_FILE,
JSON.stringify(travel, null, 2)
)

res.send("travel stored")

}

/* SHARE LOCATION */
function shareLocation(req, res) {

const { lat, lon } = req.body

let travel = JSON.parse(
fs.readFileSync(TRAVEL_FILE, "utf8") || "[]"
)

travel.push(getTimeData("GPS_SHARED", lat, lon))

fs.writeFileSync(
TRAVEL_FILE,
JSON.stringify(travel, null, 2)
)

res.send("gps stored")

}

/* SOS */
function sendSOS(req, res) {

const { lat, lon } = req.body

let travel = JSON.parse(
fs.readFileSync(TRAVEL_FILE, "utf8") || "[]"
)

travel.push(getTimeData("SOS_ALERT", lat, lon))

fs.writeFileSync(
TRAVEL_FILE,
JSON.stringify(travel, null, 2)
)

res.send("sos stored")

}

module.exports = {
startTravel,
shareLocation,
sendSOS
}