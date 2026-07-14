const fs = require("fs")

const CONTACT_FILE = "./data/contacts.json"

/* SAVE CONTACT */
function saveContact(req, res) {

const { number } = req.body

let contacts = JSON.parse(
fs.readFileSync(CONTACT_FILE, "utf8") || "[]"
)

const exists = contacts.some(c => c.number === number)

if (exists) {
return res.send("exists")
}

contacts.push({ number })

fs.writeFileSync(
CONTACT_FILE,
JSON.stringify(contacts, null, 2)
)

res.send("saved")

}

/* GET CONTACTS */
function getContacts(req, res) {

let contacts = JSON.parse(
fs.readFileSync(CONTACT_FILE, "utf8") || "[]"
)

res.json(contacts)

}

module.exports = {
saveContact,
getContacts
}