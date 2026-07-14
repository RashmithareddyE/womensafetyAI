const express = require("express")
const fs = require("fs")

const connectDB = require("./config/db")
const extractFeatures = require("./services/featureExtractor")
const calculateRisk = require("./services/riskEngine")

const authRoutes = require("./routes/authRoutes")
const contactRoutes = require("./routes/contactRoutes")
const travelRoutes = require("./routes/travelRoutes")
const riskRoutes = require("./routes/riskRoutes")

const AI_PREDICTION_FILE = "./data/aiPredictions.json"

const app = express()

connectDB()

app.use(express.json())
app.use(express.static("public"))

app.use("/", authRoutes)
app.use("/", contactRoutes)
app.use("/", travelRoutes)
app.use("/", riskRoutes)



app.listen(3000, () => {

    console.log("Server running at http://localhost:3000")

})