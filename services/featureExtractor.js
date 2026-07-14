async function extractFeatures(req) {

    const now = new Date()

    return {

        hour: now.getHours(),

        day: now.toLocaleString("en-US", {
            weekday: "long"
        }),

        weather: "Unknown",

        battery: null,

        latitude: req.body.lat,

        longitude: req.body.lon,

        areaType: "Unknown",

        policeDistance: null,

        hospitalDistance: null,

        crowdLevel: "Unknown"

    }

}

module.exports = extractFeatures