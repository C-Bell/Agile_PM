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

app.post("/login", (req, res) => {
  // set
  console.log(req.body);
  User.find(
    { username: req.body.username, password: req.body.password },
    (err, user) => {
      if (err || user[0] == null) {
        res.send({
          errorCode: "Incorrect Password",
          errorMessage:
            "We did not recognise that username and password, please try again!"
        });
        //throw err;
      } else {
        req.session.Authed = true;
        console.log(user);
        // Can use status codes
        res.redirect("/home");
      }
    }
  );
});

app.use(authMiddleware);

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/home", function(req, res) {
  res.render("home");
});


module.exports = app;
