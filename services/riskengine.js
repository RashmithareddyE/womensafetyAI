function calculateRisk(data) {

    let score = 0
    let reasons = []

    // ---------- Time ----------
    const hour = data.hour

    if (hour >= 21 || hour <= 5) {
        score += 30
        reasons.push("Late Night")
    }

    else if (hour >= 18) {
        score += 15
        reasons.push("Evening")
    }

    // ---------- Battery ----------
    if (data.battery <= 20) {
        score += 15
        reasons.push("Low Battery")
    }

    // ---------- Weather ----------
    if (data.weather === "Rain") {
        score += 10
        reasons.push("Rain")
    }

    if (data.weather === "Storm") {
        score += 20
        reasons.push("Storm")
    }

    return {

        score,

        reasons

    }

}

module.exports = calculateRisk