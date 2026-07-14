const fs = require("fs")

const RISK_FILE = "./data/risk.json"

/* SAVE RISK */
function saveRisk(req, res) {

const { message } = req.body

let risks = JSON.parse(
fs.readFileSync(RISK_FILE, "utf8") || "[]"
)

risks.push({
message: message,
time: new Date().toLocaleString()
})

fs.writeFileSync(
RISK_FILE,
JSON.stringify(risks, null, 2)
)

res.send("risk saved")

}

module.exports = {
saveRisk
}