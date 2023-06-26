const express = require("express")
const app = express()
const cors = require("cors")
require("dotenv").config()
const MONGO_URI = process.env["MONGO_URI"]
const mongoose = require("mongoose")
const Schema = mongoose.Schema

// MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// Express
app.use(cors())
app.use(express.static("public"))

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html")
})

mongoose.connection.once("open", (err) => {
  if (err) return console.error(err)
  console.log("Connected to MongoDB")
  const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port)
  })
})
