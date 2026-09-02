let lastLat = null
let lastLon = null
let stopTimer = null
let autoSOS = null

window.onload = function () {

  /* This is a protected page — bounce back to login if there's no token */
  if (!getAuthToken()) {
    window.location.href = "index.html"
    return
  }

  document.getElementById("popup").style.display = "block"
  loadContacts()
}

function closePopup() {
  document.getElementById("popup").style.display = "none"
}

/*
 * Captures a full GPS reading from the browser. Any value the browser
 * doesn't provide (speed, heading, altitude are commonly unavailable,
 * especially indoors or on desktop) is passed through as null rather
 * than being replaced with a fake number.
 */
function getLocation(callback) {

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by this browser.")
        return
    }

    navigator.geolocation.getCurrentPosition(

        function (position) {

            const coords = position.coords

            callback({
                latitude: coords.latitude,
                longitude: coords.longitude,
                accuracy: coords.accuracy ?? null,
                altitude: coords.altitude ?? null,
                speed: coords.speed ?? null,
                heading: coords.heading ?? null,
                timestamp: position.timestamp
            })

        },

        function (error) {

            switch (error.code) {

                case error.PERMISSION_DENIED:
                    alert("Location permission denied")
                    break

                case error.POSITION_UNAVAILABLE:
                    alert("Location unavailable")
                    break

                case error.TIMEOUT:
                    alert("Location request timed out")
                    break

                default:
                    alert("Unknown location error")
            }

        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }

    )

}

/* START TRAVEL + START TRACKING */
function startTravel() {

    closePopup()

    getLocation((loc) => {

        fetch("/travel-start", {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ lat: loc.latitude, lon: loc.longitude })
        })
        .then(res => res.text())
        .then(() => {
            alert("Travel started and location stored")
        })

        updateCurrentLocation(loc)

    })

    setTimeout(function () {

        document.getElementById("safetyBox").style.display = "block"

        /* AUTO SOS AFTER 5 SECONDS IF NO RESPONSE */
        autoSOS = setTimeout(function () {
            sendSOS()
        }, 5000)

    }, 20000)

}

/* AFTER 10 SECONDS SHOW SAFETY CHECK */
setTimeout(function () {

    document.getElementById("safetyBox").style.display = "block"

}, 10000)

/* SHARE GPS BUTTON — also the source of the dashboard's location display */
function shareLocation() {

    getLocation((loc) => {

        fetch("/share-location", {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(loc)
        })
        .then(res => res.json())
        .then(data => {

            updateLocationDisplay(data.location, data.address)
            updateCurrentLocation(data.location)

            alert("Location shared successfully")

        })
        .catch(() => {
            alert("Unable to share location right now")
        })

    })

}

/* SOS */
function sendSOS() {

    getLocation((loc) => {

        fetch("/sos", {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ lat: loc.latitude, lon: loc.longitude })
        })
        .then(res => res.text())
        .then(() => {
            alert("SOS sent successfully")
        })

        updateCurrentLocation(loc)

    })

}

/* SAFETY POPUP BUTTONS */
function sendAlert() {

    clearTimeout(autoSOS)

    document.getElementById("safetyBox").style.display = "none"

    sendSOS()

}

/* CONTACTS */
function addContact() {

    const number = prompt("Enter emergency contact number")

    if (!number) return

    fetch("/save-contact", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ number })
    })
    .then(res => res.text())
    .then(data => {

        if (data === "exists") {
            alert("Contact already present")
        }

        else {
            alert("Contact saved successfully")
            loadContacts()
        }

    })

}

function loadContacts() {

    fetch("/get-contacts", {
        headers: authHeaders()
    })
    .then(res => res.json())
    .then(data => {

        const list = document.getElementById("contactList")
        list.innerHTML = ""

        data.forEach(c => {
            const div = document.createElement("div")
            div.innerText = c.number
            list.appendChild(div)
        })

    })

}

/* LOGIN / SIGNUP POPUP TOGGLES (signup()/login() themselves live in login.js) */
function openLogin() {
    document.getElementById("loginPopup").classList.remove("hidden")
}

function closeLogin() {
    document.getElementById("loginPopup").classList.add("hidden")
}

function openSignup() {
    document.getElementById("signupPopup").classList.remove("hidden")
}

function closeSignup() {
    document.getElementById("signupPopup").classList.add("hidden")
}

/* AI RISK GENERATION */
async function generateRisk() {

    try {

        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject)
        })

        const lat = position.coords.latitude
        const lon = position.coords.longitude

        const response = await fetch("/calculate-risk", {

            method: "POST",

            headers: authHeaders(),

            body: JSON.stringify({
                lat,
                lon
            })

        })

        const data = await response.json()

        document.getElementById("riskPercent").innerText =
            data.risk.score + "%"

    }
    catch (err) {

        console.error(err)

        alert("Unable to calculate risk")

    }

}

/* SAFE BUTTON */
function staySafe() {

    clearTimeout(autoSOS)

    document.getElementById("safetyBox").style.display = "none"

    generateRisk()

}

/* SAVE RISK MESSAGE */
function saveRiskMessage() {

    let msg = document.getElementById("riskMessage").value

    if (msg === "") {
        alert("Please enter a message")
        return
    }

    fetch("/save-risk", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ message: msg })
    })
    .then(res => res.text())
    .then(data => {
        alert("Message saved successfully")
    })

    document.getElementById("riskMessage").value = ""

}

/* ---------- LOCATION DISPLAY ---------- */

function formatAddress(address) {

    if (!address || !address.available) {
        return "Address temporarily unavailable"
    }

    const parts = [address.road, address.area, address.city, address.state, address.postalCode, address.country]
        .filter(Boolean)

    return parts.length > 0 ? parts.join(", ") : (address.formatted || "Address temporarily unavailable")

}

function updateLocationDisplay(location, address) {

    if (!location) return

    document.getElementById("locLat").innerText =
        location.latitude !== null && location.latitude !== undefined ? location.latitude.toFixed(6) : "--"

    document.getElementById("locLon").innerText =
        location.longitude !== null && location.longitude !== undefined ? location.longitude.toFixed(6) : "--"

    document.getElementById("locAccuracy").innerText =
        location.accuracy !== null && location.accuracy !== undefined ? `${Math.round(location.accuracy)} m` : "Unavailable"

    document.getElementById("locAddress").innerText = formatAddress(address)

    document.getElementById("locUpdated").innerText = new Date().toLocaleTimeString()

}

/* ---------- MAP ---------- */

const DEFAULT_MAP_CENTER = [12.9716, 77.5946] // Sensible default view (Bengaluru) — used until a real GPS fix arrives
const DEFAULT_MAP_ZOOM = 13
const FOCUSED_MAP_ZOOM = 15

let map = null
let currentLocationMarker = null
let accuracyCircle = null
let lastKnownLocation = null

/* A small blue dot distinguishes "you" from any future markers
   (police/hospital/destination pins in later phases) without needing
   an external icon asset. */
const currentLocationIcon = L.divIcon({
    className: "current-location-marker",
    html: '<div class="current-location-dot"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
})

/*
 * Shows a friendly, non-crashing message in place of the map when it
 * can't be initialized or a tile/provider problem is detected.
 */
function showMapError(message) {

    const container = document.getElementById("map")

    if (!container) {
        console.error("Map error:", message)
        return
    }

    container.innerHTML = `<div class="map-error">${message}</div>`

}

/*
 * A small Leaflet control that recenters on the user's last known GPS
 * fix on demand, without continuously forcing the map to follow them.
 */
function addMyLocationControl(mapInstance) {

    const MyLocationControl = L.Control.extend({

        options: { position: "topright" },

        onAdd: function () {

            const button = L.DomUtil.create("button", "my-location-control")
            button.type = "button"
            button.title = "My Location"
            button.setAttribute("aria-label", "Center on my location")
            button.innerHTML = "📍"

            L.DomEvent.disableClickPropagation(button)

            L.DomEvent.on(button, "click", function () {

                getLocation((loc) => {
                    updateCurrentLocation(loc)
                    centerOnCurrentLocation()
                    updateLocationDisplay(loc, null)
                })

            })

            return button

        }

    })

    mapInstance.addControl(new MyLocationControl())

}

/*
 * Sets up the Leaflet map. Safe to call more than once — later calls
 * are a no-op if the map already exists, so nothing double-initializes.
 * Works even if GPS is denied/unavailable: it just falls back to
 * DEFAULT_MAP_CENTER until a real fix comes in.
 */
function initializeMap() {

    if (map) {
        return map
    }

    const container = document.getElementById("map")

    if (!container) {
        console.error("Map container (#map) not found in the page.")
        return null
    }

    try {

        map = L.map("map").setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM)

        const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
            maxZoom: 19
        })

        /* Best-effort detection of tile problems — logged, not fatal. */
        tileLayer.on("tileerror", () => {
            console.warn("Some map tiles failed to load. The map may look incomplete until they retry.")
        })

        tileLayer.addTo(map)

        addMyLocationControl(map)

        /* If the container was measured before layout fully settled,
           this re-measures it so the map isn't cut off or blank. */
        setTimeout(() => map.invalidateSize(), 0)

    }

    catch (err) {

        console.error("Failed to initialize the map:", err)
        showMapError("The map couldn't be loaded right now. Other features are unaffected.")
        map = null

    }

    return map

}

/*
 * Updates the single current-location marker (and its accuracy circle)
 * to a new GPS reading. Never creates a second marker — later readings
 * just move the existing one. Invalid coordinates are ignored rather
 * than crashing the map.
 */
function updateCurrentLocation(loc) {

    if (!map) return

    if (!loc ||
        typeof loc.latitude !== "number" || typeof loc.longitude !== "number" ||
        Number.isNaN(loc.latitude) || Number.isNaN(loc.longitude) ||
        loc.latitude < -90 || loc.latitude > 90 ||
        loc.longitude < -180 || loc.longitude > 180) {
        return
    }

    const latLng = [loc.latitude, loc.longitude]
    const isFirstFix = !currentLocationMarker

    lastKnownLocation = loc

    if (isFirstFix) {
        currentLocationMarker = L.marker(latLng, { icon: currentLocationIcon })
            .addTo(map)
            .bindPopup("You are here")
    }

    else {
        currentLocationMarker.setLatLng(latLng)
    }

    updateAccuracyCircle(loc.latitude, loc.longitude, loc.accuracy)

    /* Only auto-center on the very first fix. After that the user may
       have panned around — the "My Location" control is there whenever
       they want to recenter, so later readings don't yank their view. */
    if (isFirstFix) {
        centerOnCurrentLocation()
        currentLocationMarker.openPopup()
    }

}

/*
 * Recenters the map on the last known location, on demand — used by
 * the "My Location" control and internally on the very first GPS fix.
 */
function centerOnCurrentLocation() {

    if (!map || !lastKnownLocation) return

    map.setView([lastKnownLocation.latitude, lastKnownLocation.longitude], FOCUSED_MAP_ZOOM)

}

/*
 * Draws/updates a single reusable circle showing GPS accuracy. Skipped
 * entirely (and removed if it already exists) when accuracy isn't
 * available — never guessed or faked.
 */
function updateAccuracyCircle(lat, lon, accuracyMeters) {

    if (!map) return

    if (typeof accuracyMeters !== "number" || Number.isNaN(accuracyMeters) || accuracyMeters <= 0) {

        if (accuracyCircle) {
            map.removeLayer(accuracyCircle)
            accuracyCircle = null
        }

        return

    }

    if (!accuracyCircle) {

        accuracyCircle = L.circle([lat, lon], {
            radius: accuracyMeters,
            color: "#2563eb",
            fillColor: "#2563eb",
            fillOpacity: 0.12,
            weight: 1
        }).addTo(map)

    }

    else {

        accuracyCircle.setLatLng([lat, lon])
        accuracyCircle.setRadius(accuracyMeters)

    }

}

/* Keeps the map correctly sized if its container or the window resizes,
   instead of leaving it cut off or showing blank tiles. */
window.addEventListener("resize", () => {
    if (map) {
        map.invalidateSize()
    }
})

initializeMap()

/* Initial fix on page load */
getLocation((loc) => {
    updateCurrentLocation(loc)
    updateLocationDisplay(loc, null)
})