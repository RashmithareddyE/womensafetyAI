const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

function isValidEmail(email) {
    return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function signToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    )
}

/* SIGNUP */
async function signupUser(req, res) {

    try {

        const { email, password } = req.body

        if (!isValidEmail(email) || !password || password.length < 6) {
            return res.status(400).json({ message: "Please provide a valid email and a password of at least 6 characters" })
        }

        const exists = await User.findOne({ email })

        if (exists) {
            return res.status(409).json({ message: "exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new User({
            email,
            password: hashedPassword
        })

        await newUser.save()

        const token = signToken(newUser._id)

        res.status(201).json({ message: "signup success", token, email: newUser.email })

    }

    catch (err) {

        console.error(err)
        res.status(500).json({ message: "Something went wrong during signup" })

    }

}

/* LOGIN */
async function loginUser(req, res) {

    try {

        const { email, password } = req.body

        if (!isValidEmail(email) || !password) {
            return res.status(400).json({ message: "invalid" })
        }

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(401).json({ message: "invalid" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({ message: "invalid" })
        }

        const token = signToken(user._id)

        res.status(200).json({ message: "login success", token, email: user.email })

    }

    catch (err) {

        console.error(err)
        res.status(500).json({ message: "Something went wrong during login" })

    }

}

module.exports = {
    signupUser,
    loginUser
}
