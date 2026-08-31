const Contact = require("../models/Contact")

/* SAVE CONTACT */
async function saveContact(req, res) {

    try {

        const { number } = req.body

        if (!number) {
            return res.status(400).send("A contact number is required")
        }

        const exists = await Contact.findOne({ number, owner: req.userId })

        if (exists) {
            return res.send("exists")
        }

        await Contact.create({ number, owner: req.userId })

        res.send("saved")

    } catch (err) {

        console.error(err)
        res.status(500).send("error")

    }

}

/* GET CONTACTS */
async function getContacts(req, res) {

    try {

        const contacts = await Contact.find({ owner: req.userId })

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
