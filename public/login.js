/* Shared auth helpers, used by index.html, signup.html, and dashboard.html */

function getAuthToken() {
    return localStorage.getItem("authToken")
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getAuthToken()
    }
}

function signup() {

    const email = document.getElementById("signupEmail").value
    const password = document.getElementById("signupPassword").value

    fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
        .then(res => res.json())
        .then(data => {

            if (data.message === "signup success") {

                localStorage.setItem("authToken", data.token)
                localStorage.setItem("userEmail", data.email)

                window.location.href = "dashboard.html"

            }

            else if (data.message === "exists") {
                alert("User already exists")
            }

            else {
                alert(data.message || "Signup failed")
            }

        })
        .catch(() => alert("Signup failed. Please try again."))

}

function login() {

    const email = document.getElementById("loginEmail").value
    const password = document.getElementById("loginPassword").value

    fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
        .then(res => res.json())
        .then(data => {

            if (data.message === "login success") {

                localStorage.setItem("authToken", data.token)
                localStorage.setItem("userEmail", data.email)

                window.location.href = "dashboard.html"

            }

            else {
                alert("Invalid login")
            }

        })
        .catch(() => alert("Login failed. Please try again."))

}
