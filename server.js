const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const cors = require("cors");
const app = express();
const knex = require("knex");

const register = require("./controllers/register");
const signin = require("./controllers/signin");
const image = require("./controllers/image");
const profile = require("./controllers/profile");

const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",

    user: "postgres",
    password: "test",
    database: "smart-brain",
  },
});

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send(database.users);
});

app.post("/signin", (req, res) => {
  signin.handleSignIn(req, res, db, bcrypt);
});

app.post("/register", (req, res) => {
  register.handleRegister(req, res, db, bcrypt, saltRounds);
});

app.post("/imageurl", (req, res) => {
  console.log("This is server");
  image.handleApiCall(req, res);
});

app.put("/image", (req, res) => {
  image.handleImage(req, res, db);
});

app.get("/profile/:id", (req, res) => {
  profile.handleProfile(req, res, db);
});

app.listen(3000, () => {
  console.log("Server is running at port: 3000");
});
