/*
 * One-off migration: moves any entries still sitting in the old
 * data/aiPredictions.json flat file into the RiskPrediction collection.
 *
 * The old file format had no concept of a user, so this only migrates
 * entries automatically if there's exactly one user in the database
 * (the sensible assumption for local/dev data). If there's more than
 * one user, it skips migration and tells you to assign ownership by
 * hand, rather than silently guessing who a record belongs to.
 *
 * Usage: node scripts/migrateAiPredictions.js
 */

require("dotenv").config()

const fs = require("fs")
const path = require("path")

const connectDB = require("../config/db")
const User = require("../models/User")
const RiskPrediction = require("../models/RiskPrediction")

const FILE_PATH = path.join(__dirname, "..", "data", "aiPredictions.json")

async function run() {

    if (!fs.existsSync(FILE_PATH)) {
        console.log("No data/aiPredictions.json file found — nothing to migrate.")
        process.exit(0)
    }

    const raw = fs.readFileSync(FILE_PATH, "utf8").trim()
    const entries = raw ? JSON.parse(raw) : []

    if (entries.length === 0) {
        console.log("data/aiPredictions.json is empty — nothing to migrate.")
        process.exit(0)
    }

    await connectDB()

    const users = await User.find({})

    const alreadyOwned = entries.filter(e => e.owner)
    const unowned = entries.filter(e => !e.owner)

    let ownerIdForUnowned = null

    if (unowned.length > 0) {

        if (users.length === 1) {
            ownerIdForUnowned = users[0]._id
            console.log(`Assigning ${unowned.length} un-owned record(s) to the only user in the DB (${users[0].email}).`)
        }

        else {
            console.log(`Found ${unowned.length} record(s) with no owner and ${users.length} users in the database.`)
            console.log("Refusing to guess which user they belong to. Migrating only the records that already have an owner.")
        }

    }

    /*
     * The RiskPrediction schema no longer has a "time" field — it relies on
     * the auto-managed `createdAt` instead. The old flat-file entries only
     * have a locale-formatted time string, so we do our best to parse it
     * into a real Date and carry it over as `createdAt`; if it can't be
     * parsed, we just let Mongoose stamp createdAt with the migration time.
     */
    function toDoc(entry, ownerId) {

        const doc = {
            owner: ownerId,
            features: entry.features,
            prediction: entry.prediction
        }

        const parsed = entry.time ? new Date(entry.time) : null

        if (parsed && !isNaN(parsed.getTime())) {
            doc.createdAt = parsed
        }

        return doc

    }

    const toInsert = []

    for (const entry of alreadyOwned) {
        toInsert.push(toDoc(entry, entry.owner))
    }

    if (ownerIdForUnowned) {
        for (const entry of unowned) {
            toInsert.push(toDoc(entry, ownerIdForUnowned))
        }
    }

    if (toInsert.length === 0) {
        console.log("Nothing eligible to migrate. No changes made.")
        process.exit(0)
    }

    await RiskPrediction.insertMany(toInsert)

    console.log(`Migrated ${toInsert.length} prediction(s) into the RiskPrediction collection.`)

    const remaining = entries.length - toInsert.length

    if (remaining > 0) {
        console.log(`${remaining} record(s) were left in data/aiPredictions.json — assign an owner and re-run to migrate them.`)
    }

    else {
        const backupPath = FILE_PATH + ".migrated"
        fs.renameSync(FILE_PATH, backupPath)
        console.log(`All records migrated. Renamed data/aiPredictions.json -> ${path.basename(backupPath)} as a backup.`)
    }

    process.exit(0)

}

run().catch(err => {
    console.error("Migration failed:", err)
    process.exit(1)
})
