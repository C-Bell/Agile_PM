const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");

// Custom Mongoose Models -
const Project = require("../models/project");
const Deadline = require("../models/deadline");
const Resource = require("../models/resource");
const User = require("../models/user");

// Authentication Middleware -
// Abstracts all authentication to a helper function, returns an error or user object
const authMiddleware = require("../helpers/authMiddleware");
const helpers = require('../helpers/apihelper');
const validator = require('../helpers/validator')
const authenticateUser = helpers.authenticateWebUser;

const express = require('express');
const app = express.Router();

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", async (req, res) => {
  let isValidUser = false;

    const newUser = new User({
      name: req.body.first_name + " " + req.body.last_name,
      username: req.body.username,
      password: req.body.password,
      type: "user",
      projects: null
    });

    // TODO: Modular validation
    isValidUser = await validator.user(newUser);

    console.log('The result of the validation: ' + isValidUser );

    newUser.save((err, newUser) => {
      if(err) {
        console.log(err);
      } else {
      console.log("User saved successfully!");
      console.log(newUser);
      // Log the newly registered user in - I.E Authorise this session
      req.session.Authed = true;
      req.session.userID = newUser._id;
      console.log(req.session);

      res.send(newUser);
    }
  });
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

/* ------------------------------------------------------------------------ */

/* -------------------------- Middleware Layer ----------------------- */
/* Everything below this line requires an authorised session to access */
app.use(authMiddleware);
/* ------------------------------------------------------------------- */

app.get("/projects", async (req, res) => {
  let requester = req.session;
  let access = "none";
  let result = await authenticateUser(requester, access);
  let projectRecords = [];
  if (!result.error) {
    if(result.projects != null && result.projects.length > 0) {
      for(let i = 0; i < result.projects.length; ++i) {
        projectRecords[i] =  await helpers.getProject(result.projects[i]);
      }
      console.log('SENDING RESULT');
      res.send(projectRecords);
  } else {
    res.send(result);
  }
}
});

app.get("/user", async (req, res) => {
  let requester = req.session;
  let access = "none";
  let result = await authenticateUser(requester, access);
  delete result.password;
  res.send(result);
});

app.get('/projects/:pID', async (req, res) => {
  let requester = req.session;
  let access = "none";
  let result = await authenticateUser(requester, access);
  let projectRecord = {};
  if (!result.error) {
        projectRecord =  await helpers.getProject([req.params.pID]);
      console.log('RENDERING RESULT');
      console.log(projectRecord._id);
      if(projectRecord != null) {
        res.render('project', {
          project : projectRecord.record,
          deadlines : projectRecord.deadlineObjects,
          resources : projectRecord.resourceObjects,
          users : projectRecord.users,
          user: result,
          helpers: { // TODO
            isAdmin: function (result) { if(result.type == "admin") {return true;} else {return false;} },
            isUserOrAbove: function (result) { if(result.type == "admin" || result.type == "user") {return true;} else {return false;} }
          }
      });
      } else {
        res.send(404);
      }
    } else {
      res.send(result.error);
    }
});

app.post("/projects/new", async (req, res) => {
  let requester = req.session
  let access = "none";
  let result = await authenticateUser(requester, access);
  console.log("New Project: ");
  console.log(req.body);

  if (!result.error) { // Is this a valid user?
    let projectSchema = new Project({
      owner: result._id,
      title: req.body.title,
      body: req.body.body,
      date: req.body.date,
      deadlines: null,
      resources: null
    });

    projectSchema.save((err, newProject) => {
      if (err) throw err;
      console.log("Project saved successfully!");
      // Render the project page
      console.log(newProject);
      res.send(newProject);
    });
  } else { // Send result which is a Error JSON object
    res.send(result);
  }
});

app.post("/deadlines/create", async (req, res) => {
  let requester = req.session;
  let access = "none";
  let result = await authenticateUser(requester, access);
  console.log('Input from user for new Deadline: ');
  console.log(req.body);

  if (!result.errorCode) { // Is this a valid user?
    const newDeadline = new Deadline({
      project: req.body.project,
      datetime: req.body.datetime,
      title: req.body.title
    });

    console.log(newDeadline);

    newDeadline.save((err, deadline) => {
      if (err) throw err;
      res.send(deadline);
    });
  } else { // Send Error Code
    res.send(result);
  }
});

app.post("/resources/create", async (req, res) => {
  let requester = req.session;
  let access = "none";
  let result = await authenticateUser(requester, access);

  if (!result.errorCode) {
    const newResource = new Resource({
      project: req.body.project,
      name: req.body.name,
      desc: req.body.desc,
      fromDate: req.body.fromDate,
      toDate: req.body.toDate
    });

    newResource.save((err, resource) => {
      if (err) throw err;
      res.send(resource);
    });
  } else {
    res.send(result);
  }
});

app.post("/search", async (req, res) => {
  let requester = req.session;
  let access = "none";
  let result = await authenticateUser(requester, access);
  let objresults = [];
  let projectRecords;
  console.log("New Search: ");
  console.log(req.body.search);

  if (!result.error) {
  // REGEX Search function is passed to the MongoDB and executed
  Project.find({ "title": { "$regex": req.body.search, "$options": "i" } }, async (err, docs) => {
    // Docs is an array of matching ID's
    console.log(docs);
    for(let i = 0; i < docs.length; ++i) {
      // Synchronously call our async function getProject to resolve the array.
      projectRecord =  await helpers.getProject(docs);
      objresults.push(projectRecord);
    }
    // If we didn't get any matches, send a JSON error
    if(objresults.length < 1) {
      res.send({ error: 'No results found', errorMessage: 'We could not find any Project records matching your search term!'});
    } else {
      // Send results
      res.send(objresults);
    }
  });
  } else {
    // Send Invalid credentials error
    res.send(result);
  }
});

app.get("/search", async (req, res) => {
  let requester = req.session;
  let access = "none";
  let result = await authenticateUser(requester, access);
  delete result.password;
  res.render("search", {
    user: result // Pass the current logged in user into the page for rendering.
  });
});

app.get("/", async (req, res) => {
  let requester = req.session;
  let access = "none";
  let result = await authenticateUser(requester, access);
  delete result.password;
  res.render("home", {
    user: result
  });
});

app.get("/newprojects", async (req, res) => {
  let requester = req.session;
  let access = "none";
  let result = await authenticateUser(requester, access);
  delete result.password;
  res.render("newproject", {
    user: result
  });
});

app.get("/home", async (req, res) => {
  let requester = req.session;
  let access = "none";
  let result = await authenticateUser(requester, access);
  delete result.password;
  res.render("home", {
    user: result
  });
});

module.exports = app;
