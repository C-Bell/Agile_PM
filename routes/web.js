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
const authMiddleware = require("../helpers/authMiddleware");

const helpers = require('../helpers/apihelper')
const authenticateUser = helpers.authenticateWebUser;

const express = require('express');
const app = express.Router();

app.get("/login", function(req, res) {
  res.render("login");
});

/* --------------------------- Login POST Request ------------------------- */
/* This route allows us to get an authorised session if we are a valid user */
/* An authorised session then allows us to access any routes below the Middleware Layer */
app.post("/login", (req, res) => {
  //console.log(req);
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
        req.session.userID = user[0]._id; // TODO: Vulnerability
        console.log(req.session);
        // Send an OK status code for: Successfully executed
        res.send(200);
      }
    }
  );
});

app.get("/projects", async (req, res) => {
  let requester = req.session;
  let access = "none";
  let result = await authenticateUser(requester, access);
  let projects = [];
  if (!result.error) {
    for(let i = 0; i < result.projects.length; ++i) {
      Project.findById(result.projects[i], function (err, project) {
        // TODO: Return resources and deadlines as projects
        // console.log(projects.resources)
        // if(projects.resources != null) {
        //   if(projects.resources.length != 0) {
        //     let resources = [];
        //     for(let j = 0; j < projects.resources.length; ++i) {
        //       Resource.findById(projects.resources[j], function (err, resource) {
        //         resources.push(resource);
        //         console.log(resource)
        //       });
        //     }
        //     project.resources = resources;
        //   }
        // }

        projects.push(project);
        if(i == (result.projects.length-1)) {
          res.send(projects);
        }
      });
    }
  } else {
    res.send(result);
  }
});

app.get("/user", async (req, res) => {
  let requester = req.session;
  let access = "none";
  let result = await authenticateUser(requester, access);
  delete result.password;
  res.send(result);
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
