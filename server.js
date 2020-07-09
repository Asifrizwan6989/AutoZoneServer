const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
//const config = require('./config');

const app = express();
const port = process.env.port || 5000;

app.use(cors());
app.use(express.json());

const mongoDB =
  "mongodb+srv://asif:asif@cluster0-un35d.mongodb.net/Autozone?retryWrites=true&w=majority";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

//Get the default connection
const db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const UserRouter = require("./routers/User");

app.use("/user", UserRouter);

app.listen(port, () => {
  console.log(`Server running in the port: ${port}`);
});
