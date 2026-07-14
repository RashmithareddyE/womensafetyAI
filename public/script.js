let lastLat = null
let lastLon = null
let stopTimer = null
let autoSOS = null

window.onload = function () {
  document.getElementById("popup").style.display = "block"
  loadContacts()
}

function closePopup() {
  document.getElementById("popup").style.display = "none"
}

function getLocation(callback) {

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by this browser.")
        return
    }

    navigator.geolocation.getCurrentPosition(

        function (position) {

            const lat = position.coords.latitude
            const lon = position.coords.longitude

            console.log("Latitude:", lat)
            console.log("Longitude:", lon)
            console.log("Accuracy:", position.coords.accuracy + " meters")

            callback(lat, lon)

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

    getLocation((lat, lon) => {

        fetch("/travel-start", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ lat, lon })
        })
        .then(res => res.text())
        .then(() => {
            alert("Travel started successfully")
        })

    })

    setTimeout(() => {

        document.getElementById("safetyBox").style.display = "block"

        autoSOS = setTimeout(() => {
            sendSOS()
        }, 5000)

    }, 20000)

}

    setTimeout(function () {

        document.getElementById("safetyBox").style.display = "block"

        /* AUTO SOS AFTER 5 SECONDS IF NO RESPONSE */
        autoSOS = setTimeout(function () {
            sendSOS()
        }, 5000)

    }, 20000)



/* AFTER 10 SECONDS SHOW SAFETY CHECK */
setTimeout(function () {

document.getElementById("safetyBox").style.display = "block"

}, 10000)

/* SHARE GPS BUTTON */
function shareLocation() {

    getLocation((lat, lon) => {

        fetch("/share-location", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ lat, lon })
        })
        .then(res => res.text())
        .then(() => {
            alert("Location shared successfully")
        })

    })

}

/* SOS */
function sendSOS() {

    getLocation((lat, lon) => {

        fetch("/sos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ lat, lon })
        })
        .then(res => res.text())
        .then(() => {
            alert("SOS sent successfully")
        })

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

fetch("/save-contact", {
method: "POST",
headers: { "Content-Type": "application/json" },
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

fetch("/get-contacts")
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

/* LOGIN / SIGNUP */
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

/* SIGNUP */
function signup() {

const email = document.getElementById("signupEmail").value
const password = document.getElementById("signupPassword").value

fetch("/signup", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ email, password })
})
.then(res => res.text())
.then(data => {

if (data === "signup success") {

alert("Signup successful")

document.getElementById("signupPopup").classList.add("hidden")

}

else if (data === "exists") {

alert("User already exists")

}

else {

alert("Signup failed")

}

})

}

/* LOGIN */
function login() {

const email = document.getElementById("loginEmail").value
const password = document.getElementById("loginPassword").value

fetch("/login", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ email, password })
})
.then(res => res.text())
.then(data => {

if (data === "login success") {

alert("Login successful")

document.getElementById("loginPopup").classList.add("hidden")

}

else {

alert("Invalid login")

}

})

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

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                lat,
                lon
            })

        })

        const data = await response.json()

        document.getElementById("riskPercent").innerText =
            data.risk.score + "%"

        console.log("AI Result:", data)

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
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ message: msg })
})
.then(res => res.text())
.then(data => {
alert("Message saved successfully")
})

document.getElementById("riskMessage").value = ""
}