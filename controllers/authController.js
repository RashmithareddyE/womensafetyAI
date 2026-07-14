const User = require("../models/User")
const bcrypt = require("bcryptjs")

/* SIGNUP */
async function signupUser(req, res) {

const { email, password } = req.body

const exists = await User.findOne({ email })

if(exists){

return res.send("exists")

}

const hashedPassword = await bcrypt.hash(password, 10)

const newUser = new User({
email,
password: hashedPassword
})

await newUser.save()

res.send("signup success")

}

/* LOGIN */
async function loginUser(req, res) {

const { email, password } = req.body

const user = await User.findOne({ email })

if(!user){

return res.send("invalid")

}

const isMatch = await bcrypt.compare(password, user.password)

if(isMatch){

res.send("login success")

}

else{

res.send("invalid")

}

}

module.exports = {
signupUser,
loginUser
}