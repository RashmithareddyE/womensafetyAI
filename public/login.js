function signup() {

const email = document.getElementById("signupEmail").value
const password = document.getElementById("signupPassword").value

fetch("/signup", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({ email, password })
})
.then(res => res.text())
.then(data => {

if(data === "signup success"){

localStorage.setItem("userEmail", email)

window.location.href = "dashboard.html"

}

else{

alert("User already exists")

}

})

}

function login() {

const email = document.getElementById("loginEmail").value
const password = document.getElementById("loginPassword").value

fetch("/login", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({ email, password })
})
.then(res => res.text())
.then(data => {

if(data === "login success"){

localStorage.setItem("userEmail", email)

window.location.href = "dashboard.html"

}

else{

alert("Invalid login")

}

})

}