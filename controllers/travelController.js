const Trip = require("../models/Trip")

function getTimeData(event, lat, lon) {

    const now = new Date()

    return {
        event,
        date: now.toLocaleDateString(),
        day: now.toLocaleString("en-US", { weekday: "long" }),
        time: now.toLocaleTimeString(),
        lat,
        lon
    }

}

async function startTravel(req, res) {

    try {

        const { lat, lon } = req.body

        await Trip.create({
            ...getTimeData("TRAVEL_START", lat, lon),
            owner: req.userId
        })

        res.send("travel stored")

    } catch (err) {

        console.error(err)
        res.status(500).send("error")

    }

}

/* SHARE LOCATION */
async function shareLocation(req, res) {

    try {

        const { lat, lon } = req.body

        await Trip.create({
            ...getTimeData("GPS_SHARED", lat, lon),
            owner: req.userId
        })

        res.send("gps stored")

    } catch (err) {

        console.error(err)
        res.status(500).send("error")

    }

}

/* SOS */
async function sendSOS(req, res) {

    try {

        const { lat, lon } = req.body

        await Trip.create({
            ...getTimeData("SOS_ALERT", lat, lon),
            owner: req.userId
        })

        res.send("sos stored")

    } catch (err) {

        console.error(err)
        res.status(500).send("error")

    }

}

module.exports = {
    startTravel,
    shareLocation,
    sendSOS
}
