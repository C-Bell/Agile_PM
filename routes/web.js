const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");

// Custom Mongoose Models -
const Project = require("../models/project");
const Deadline = require("../models/deadline");
const Resource = require("../models/resource");
const User = require("../models/user");

// Authentication Middleware TODO: Move to helper folder
const authMiddleware = require("../authMiddleware");

const express = require('express');
const app = express.Router();

app.get("/login", function(req, res) {
  res.render("login");
});

/* --------------------------- Login POST Request ------------------------- */
/* This route allows us to get an authorised session if we are a valid user */
/* An authorised session then allows us to access any routes below the Middleware Layer */
app.post("/login", (req, res) => {
  console.log(req.body);

  User.find(
    { username: req.body.username, password: req.body.password },
    (err, user) => {
      if (err || user[0] == null) {
        res.send({
          responseCode: 401,
          errorCode: "Incorrect Password",
          errorMessage:
            "We did not recognise that username and password, please try again!"
        });
      } else {
        // Authorise this session
        req.session.Authed = true;
        // Send an OK status code for: Successfully executed
        res.send(200);
      }
    }
  );
});
/* ------------------------------------------------------------------------ */

/* -------------------------- Middleware Layer ----------------------- */
/* Everything below this line requires an authorised session to access */
app.use(authMiddleware);
/* ------------------------------------------------------------------- */

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/home", function(req, res) {
  res.render("home");
});

module.exports = app;
