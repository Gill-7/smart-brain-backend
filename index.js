const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require("cors");
const knex = require("knex");
require("dotenv").config();

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const saltRounds = 10;

const register = require("./controllers/register");
const signin = require("./controllers/signin");
const signout = require("./controllers/signout");
const image = require("./controllers/image");
const profile = require("./controllers/profile");
const auth = require("./controllers/authorization");

// const pg = require("pg");

// const { Pool } = pg;

// const pool = new Pool({
//   connectionString: process.env.POSTGRES_URL,
// });

const db = knex({
  client: "pg",
  connection: {
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
    // host: process.env.DATABASE_HOST,
    // port: 5432,
    // user: process.env.DATABASE_USER,
    // password: process.env.DATABASE_PW,
    // database: process.env.DATABASE_DB,
  },
});

// const db = knex({
//   client: "pg",
//   connection: {
//     host: "",
//     user: "",
//     database: "",
//   },
// });

app.use(bodyParser.json());
app.use(cors({
    origin: "https://facefinder.vercel.app",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

app.get("/", (req, res) => {
  res.send(database.users);
});

app.post("/signin", (req, res) => {
  signin.signInAuthentication(req, res, db, bcrypt);
});

app.post("/register", (req, res) => {
  register.handleRegister(req, res, db, bcrypt, saltRounds);
});

app.post("/imageurl", auth.requireAuth, (req, res) => {
  image.handleApiCall(req, res);
});

app.put("/image", auth.requireAuth, (req, res) => {
  image.handleImage(req, res, db);
});

app.get("/profile/:id", auth.requireAuth, (req, res) => {
  profile.handleProfile(req, res, db);
});

app.post("/profile/:id", auth.requireAuth, (req, res) => {
  profile.handleProfileUpdate(req, res, db);
});

app.post("/signout", (req, res) => {
  signout.handlerSignout(req, res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at port: ${PORT}`);
});
