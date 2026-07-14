const Contact = require("../models/Contact")

/* SAVE CONTACT */
async function saveContact(req, res) {

    try {

        const { number } = req.body

        const exists = await Contact.findOne({ number })

        if (exists) {
            return res.send("exists")
        }

        await Contact.create({ number })

        res.send("saved")

    } catch (err) {

        console.error(err)
        res.status(500).send("error")

    }

}

/* GET CONTACTS */
async function getContacts(req, res) {

    try {

        const contacts = await Contact.find()

        res.json(contacts)

    } catch (err) {

        console.error(err)
        res.status(500).send("error")

    }

}

module.exports = {
    saveContact,
    getContacts
}