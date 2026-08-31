require("dotenv").config()

const express = require("express")

const connectDB = require("./config/db")

const authRoutes = require("./routes/authRoutes")
const contactRoutes = require("./routes/contactRoutes")
const travelRoutes = require("./routes/travelRoutes")
const riskRoutes = require("./routes/riskRoutes")

const app = express()

connectDB()

app.use(express.json())
app.use(express.static("public"))

app.use("/", authRoutes)
app.use("/", contactRoutes)
app.use("/", travelRoutes)
app.use("/", riskRoutes)

/* 404 handler for unknown API routes */
app.use((req, res) => {
    res.status(404).json({ message: "Not found" })
})

/* Generic error handler so unexpected errors don't crash the process */
app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ message: "Something went wrong" })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {

    console.log(`Server running at http://localhost:${PORT}`)

})
