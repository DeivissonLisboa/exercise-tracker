const express = require("express")
const app = express()
const cors = require("cors")
const bodyParser = require("body-parser")
require("dotenv").config()
const MONGO_URI = process.env["MONGO_URI"]
const mongoose = require("mongoose")
const Schema = mongoose.Schema

// MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
})

const User = mongoose.model("user", userSchema)

// Express
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static("public"))

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html")
})

app.post("/api/users", async (req, res) => {
  const username = req.body.username

  let result = await User.create({ username })

  res.json(result)
})

app.get("/api/users", async (req, res) => {
  const users = await User.find()

  res.json(users)
})

mongoose.connection.once("open", (err) => {
  if (err) return console.error(err)
  console.log("Connected to MongoDB")
  const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port)
  })
})
