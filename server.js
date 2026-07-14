const extractFeatures = require("./services/featureExtractor")
const calculateRisk = require("./services/riskEngine")
const connectDB = require("./config/db")
const express = require("express")
const fs = require("fs")
const AI_PREDICTION_FILE = "./data/aiPredictions.json"

const app = express()
connectDB()

app.use(express.json())
app.use(express.static("public"))

const CONTACT_FILE="./data/contacts.json"
const TRAVEL_FILE="./data/travel.json"
const USER_FILE="./data/user.json"


function getTimeData(event,lat,lon){

const now=new Date()

return{

event:event,
date:now.toLocaleDateString(),
day:now.toLocaleString("en-US",{weekday:"long"}),
time:now.toLocaleTimeString(),
lat:lat,
lon:lon

}

}


app.post("/travel-start",(req,res)=>{

const {lat,lon}=req.body

const travel=JSON.parse(fs.readFileSync(TRAVEL_FILE) || "[]")

travel.push(getTimeData("TRAVEL_START",lat,lon))

fs.writeFileSync(TRAVEL_FILE,JSON.stringify(travel,null,2))

res.send("travel stored")

})


app.post("/share-location",(req,res)=>{

const {lat,lon}=req.body

const travel=JSON.parse(fs.readFileSync(TRAVEL_FILE))

travel.push(getTimeData("GPS_SHARED",lat,lon))

fs.writeFileSync(TRAVEL_FILE,JSON.stringify(travel,null,2))

res.send("gps stored")

})


app.post("/sos",(req,res)=>{

const {lat,lon}=req.body

const travel=JSON.parse(fs.readFileSync(TRAVEL_FILE))

travel.push(getTimeData("SOS_ALERT",lat,lon))

fs.writeFileSync(TRAVEL_FILE,JSON.stringify(travel,null,2))

res.send("sos stored")

})


app.post("/save-contact",(req,res)=>{

const {number}=req.body

let contacts = JSON.parse(fs.readFileSync(CONTACT_FILE) || "[]")

// check if contact already exists
const exists = contacts.some(c => c.number === number)

if(exists){
    return res.send("exists")
}

contacts.push({number})

fs.writeFileSync(CONTACT_FILE, JSON.stringify(contacts,null,2))

res.send("saved")

})


app.get("/get-contacts",(req,res)=>{

const contacts=JSON.parse(fs.readFileSync(CONTACT_FILE))

res.json(contacts)

})


app.post("/signup",(req,res)=>{

const {email,password}=req.body

let users = JSON.parse(fs.readFileSync(USER_FILE, "utf8") || "[]")

const exists=users.find(u=>u.email===email)

if(exists){

return res.send("exists")

}

users.push({email,password})

fs.writeFileSync(USER_FILE,JSON.stringify(users,null,2))

res.send("signup success")

})


app.post("/login",(req,res)=>{

const {email,password}=req.body

let users=JSON.parse(fs.readFileSync(USER_FILE))

const user=users.find(u=>u.email===email && u.password===password)

if(user){

res.send("login success")

}

else{

res.send("invalid")

}

})

const RISK_FILE = "./data/risk.json"

app.post("/save-risk",(req,res)=>{

const {message} = req.body

let risks = JSON.parse(fs.readFileSync(RISK_FILE) || "[]")

risks.push({
message:message,
time:new Date().toLocaleString()
})

fs.writeFileSync(RISK_FILE,JSON.stringify(risks,null,2))

res.send("risk saved")

})
app.post("/calculate-risk", async (req, res) => {

    try {

        // Extract all features
        const features = await extractFeatures(req)

        // Calculate AI Risk
        const result = calculateRisk(features)

        // Read previous AI predictions
        let history = []

        if (fs.existsSync(AI_PREDICTION_FILE)) {

            history = JSON.parse(
                fs.readFileSync(AI_PREDICTION_FILE, "utf8")
            )

        }

        // Save current prediction
        history.push({

            time: new Date().toLocaleString(),

            features: features,

            prediction: result

        })

        // Write back to aiPredictions.json
        fs.writeFileSync(

            AI_PREDICTION_FILE,

            JSON.stringify(history, null, 2)

        )

        // Send response to frontend
        res.json({

            success: true,

            features,

            risk: result

        })

    }

    catch (err) {

        console.error(err)

        res.status(500).json({

            success: false,

            message: err.message

        })

    }

})
app.listen(3000,()=>{

console.log("Server running at http://localhost:3000")

})