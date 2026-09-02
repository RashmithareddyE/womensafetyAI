const Trip = require("../models/Trip")
const locationService = require("../services/locationService")

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

        const { valid, errors } = locationService.validateCoordinates({ latitude: lat, longitude: lon })

        if (!valid) {
            return res.status(400).json({ message: "Invalid location", errors })
        }

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

/*
 * SHARE LOCATION — this is also the app's location endpoint: it validates
 * the incoming GPS reading, normalizes it, looks up a readable address,
 * stores the enriched reading against a Trip, and returns the normalized
 * location + address so the dashboard can display them directly.
 */
async function shareLocation(req, res) {

    try {

        const normalized = locationService.normalizeLocation(req.body)

        const { valid, errors } = locationService.validateCoordinates({
            latitude: normalized.latitude,
            longitude: normalized.longitude,
            accuracy: normalized.accuracy
        })

        if (!valid) {
            return res.status(400).json({ message: "Invalid location", errors })
        }

        const address = await locationService.reverseGeocode(normalized.latitude, normalized.longitude)

        await Trip.create({
            ...getTimeData("GPS_SHARED", normalized.latitude, normalized.longitude),
            accuracy: normalized.accuracy,
            altitude: normalized.altitude,
            speed: normalized.speed,
            heading: normalized.heading,
            address: {
                road: address.road,
                area: address.area,
                city: address.city,
                state: address.state,
                country: address.country,
                postalCode: address.postalCode,
                formatted: address.formatted
            },
            owner: req.userId
        })

        res.json({
            message: "gps stored",
            location: normalized,
            address
        })

    } catch (err) {

        console.error(err)
        res.status(500).json({ message: "error" })

    }

}

/* SOS */
async function sendSOS(req, res) {

    try {

        const { lat, lon } = req.body

        const { valid, errors } = locationService.validateCoordinates({ latitude: lat, longitude: lon })

        if (!valid) {
            return res.status(400).json({ message: "Invalid location", errors })
        }

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
