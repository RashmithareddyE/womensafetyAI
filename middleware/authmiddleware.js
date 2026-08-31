const jwt = require("jsonwebtoken")

/*
 * Verifies the Bearer token sent in the Authorization header and attaches
 * the authenticated user's id to req.userId. Any route that needs to be
 * restricted to a logged-in user, or that needs to know which user is
 * making the request, should use this middleware.
 */
function verifyToken(req, res, next) {

    const authHeader = req.headers["authorization"]

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authentication required" })
    }

    const token = authHeader.split(" ")[1]

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.userId = decoded.userId

        next()

    }

    catch (err) {

        return res.status(401).json({ message: "Invalid or expired token" })

    }

}

module.exports = verifyToken
