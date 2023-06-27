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

const User = mongoose.model("User", userSchema)

const exerciseSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  description: String,
  duration: Number,
  date: Date,
})

const Exercise = mongoose.model("Exercise", exerciseSchema)

// Express
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static("public"))

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html")
})

app.post("/api/users", async (req, res) => {
  const username = req.body.username

  try {
    let result = await User.create({ username })
    res.json(result)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

app.post("/api/users/:_id/exercises", async (req, res) => {
  const user_id = req.params["_id"]
  let { description, duration, date } = req.body

  if (date) {
    date = new Date(date)
  } else {
    date = new Date()
  }

  try {
    const {
      _doc: { _id, username },
    } = await User.findById(user_id)

    const exercise = await Exercise.create({
      user_id,
      description,
      duration,
      date,
    })

    res.json({
      _id,
      username,
      description,
      duration: exercise.duration,
      date: date.toDateString(),
    })
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

app.get("/api/users/:_id/logs", async (req, res) => {
  const user_id = req.params["_id"]
  const { from, to, limit } = req.query

  let date = {}
  if (from) {
    date["$gte"] = new Date(from)
  }
  if (to) {
    date["$lte"] = new Date(to)
  }

  let filter = {
    user_id,
  }
  if (from || to) {
    filter.date = date
  }

  try {
    const {
      _doc: { _id, username },
    } = await User.findById(user_id)

    const exercises = await Exercise.find(filter).limit(+limit ?? 100)

    const log = exercises.map((e) => ({
      description: e.description,
      duration: e.duration,
      date: e.date.toDateString(),
    }))

    res.json({
      _id,
      username,
      count: exercises.length,
      log,
    })
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

mongoose.connection.once("open", (err) => {
  if (err) return console.error(err)
  console.log("Connected to MongoDB")
  const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port)
  })
})
