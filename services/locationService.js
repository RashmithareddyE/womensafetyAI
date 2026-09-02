/*
 * Central location utility. Anything that touches raw GPS coordinates
 * (validating them, normalizing them, measuring distance, or turning
 * them into a readable address) should go through here instead of being
 * re-implemented in individual controllers.
 */

const GEOCODING_BASE_URL = process.env.GEOCODING_BASE_URL || "https://nominatim.openstreetmap.org/reverse"
const GEOCODING_API_KEY = process.env.GEOCODING_API_KEY || null
const GEOCODING_TIMEOUT_MS = Number(process.env.GEOCODING_TIMEOUT_MS) || 5000
const GEOCODING_USER_AGENT = process.env.GEOCODING_USER_AGENT || "womensafetyai-app/1.0"

/* ---------- VALIDATION ---------- */

/*
 * Accepts { latitude, longitude, accuracy }. `accuracy` is optional —
 * only validated when present. Returns { valid, errors }.
 */
function validateCoordinates({ latitude, longitude, accuracy } = {}) {

    const errors = []

    if (typeof latitude !== "number" || Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
        errors.push("Latitude must be a number between -90 and 90")
    }

    if (typeof longitude !== "number" || Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
        errors.push("Longitude must be a number between -180 and 180")
    }

    if (accuracy !== undefined && accuracy !== null) {
        if (typeof accuracy !== "number" || Number.isNaN(accuracy) || accuracy < 0) {
            errors.push("Accuracy must not be negative")
        }
    }

    return {
        valid: errors.length === 0,
        errors
    }

}

/* ---------- NORMALIZATION ---------- */

function toNumberOrNull(value) {

    if (value === undefined || value === null || value === "") {
        return null
    }

    const num = Number(value)

    return Number.isNaN(num) ? null : num

}

/*
 * Accepts a raw GPS-ish payload (accepts both `lat`/`lon` and
 * `latitude`/`longitude` so older callers keep working) and returns a
 * consistent shape with unavailable values left as null — never faked.
 */
function normalizeLocation(raw = {}) {

    return {

        latitude: toNumberOrNull(raw.latitude ?? raw.lat),
        longitude: toNumberOrNull(raw.longitude ?? raw.lon),
        accuracy: toNumberOrNull(raw.accuracy),
        altitude: toNumberOrNull(raw.altitude),
        speed: toNumberOrNull(raw.speed),
        heading: toNumberOrNull(raw.heading),

        timestamp: raw.timestamp ? new Date(raw.timestamp) : new Date()

    }

}

/* ---------- DISTANCE ---------- */

function toRadians(degrees) {
    return degrees * (Math.PI / 180)
}

/*
 * Haversine great-circle distance between two coordinates, in meters.
 * Reusable for nearby police/hospital lookups and route analysis in
 * later phases — kept generic on purpose.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {

    const EARTH_RADIUS_METERS = 6371000

    const dLat = toRadians(lat2 - lat1)
    const dLon = toRadians(lon2 - lon1)

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return EARTH_RADIUS_METERS * c

}

/* ---------- REVERSE GEOCODING ---------- */

function unavailableAddress(message) {
    return {
        available: false,
        road: null,
        area: null,
        city: null,
        state: null,
        country: null,
        postalCode: null,
        formatted: null,
        message: message || "Address temporarily unavailable"
    }
}

/*
 * Converts coordinates into a readable address. Never throws — any
 * provider failure (network error, timeout, bad response, missing
 * config) resolves to a clearly-marked "unavailable" result so the
 * rest of the app can keep working without an address.
 */
async function reverseGeocode(latitude, longitude) {

    if (typeof latitude !== "number" || typeof longitude !== "number" ||
        Number.isNaN(latitude) || Number.isNaN(longitude)) {
        return unavailableAddress("Invalid coordinates")
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), GEOCODING_TIMEOUT_MS)

    try {

        const url = new URL(GEOCODING_BASE_URL)
        url.searchParams.set("format", "jsonv2")
        url.searchParams.set("lat", String(latitude))
        url.searchParams.set("lon", String(longitude))

        if (GEOCODING_API_KEY) {
            url.searchParams.set("key", GEOCODING_API_KEY)
        }

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                "User-Agent": GEOCODING_USER_AGENT,
                "Accept": "application/json"
            }
        })

        if (!response.ok) {
            return unavailableAddress("Address lookup failed")
        }

        const data = await response.json()
        const addr = data.address || {}

        return {
            available: true,
            road: addr.road || addr.pedestrian || null,
            area: addr.neighbourhood || addr.suburb || null,
            city: addr.city || addr.town || addr.village || null,
            state: addr.state || null,
            country: addr.country || null,
            postalCode: addr.postcode || null,
            formatted: data.display_name || null,
            message: null
        }

    }

    catch (err) {

        return unavailableAddress("Address lookup failed")

    }

    finally {

        clearTimeout(timeoutId)

    }

}

module.exports = {
    validateCoordinates,
    normalizeLocation,
    calculateDistance,
    reverseGeocode
}
