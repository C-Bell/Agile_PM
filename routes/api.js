const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");

// Custom Mongoose Models -
const Project = require("../models/project");
const Deadline = require("../models/deadline");
const Resource = require("../models/resource");
const User = require("../models/user");
const auth = require("basic-auth");

const express = require('express');
const app = express.Router();

const helpers = require('../helpers/apihelper')
const authenticateUser = helpers.authenticateUser;

/* API Routes */

app.post("/api/login", async (req, res) => {
  let requester = auth(req);
  let access = "none";
  let result = await authenticateUser(requester, access);

  res.send(result);
});

app.post("/users/create", async (req, res) => {
  let requester = auth(req);
  let access = "admin";
  let result = await authenticateUser(requester, access);
  console.log(result);
  if (!result.errorCode) {
    const newUser = new User({
      name: req.body.first_name + " " + req.body.last_name,
      username: req.body.username,
      password: req.body.password,
      type: req.body.type,
      projects: null
    });

    newUser.save((err, newUser) => {
      if (err) throw err;
      console.log("User saved successfully!");
      res.send(newUser);
    });
  } else {
    res.send(result);
  }
});

app.patch("/users/update", async (req, res) => {
  let requester = auth(req);
  let access = "admin";
  let result = await authenticateUser(requester, access);
  let id = req.body.userID
  let updateFields = req.body.updates
  console.log(req.body);

  if(!result.errorCode) {

    User.findById(id, function (err, userToUpdate) {
      if (err || userToUpdate == null) {
        throw err;
        res.send({responseCode: 204, errorCode: "User Not Found", errorMessage: "This is not a valid user ID!"})
      } else {
        userToUpdate.set(req.body.updateFields);
        userToUpdate.save(function (err, updatedUser) {
          if (!err)
          res.send(updatedUser);
        });
      }
    });
  } else {
    return result;
  }
});

app.post("/deadlines/create", async (req, res) => {
  let requester = auth(req);
  let access = "admin";
  let result = await authenticateUser(requester, access);
  console.log(result);

  if (!result.errorCode) {
    const newDeadline = new Deadline({
      project: req.body.projectid,
      datetime: req.body.datetime,
      title: req.body.title
    });

    newDeadline.save((err, deadline) => {
      if (err) throw err;
      res.send(deadline);
    });
  } else {
    res.send(result);
  }
});

// TODO: Fix the trigger fire on Project
app.patch("/deadlines/update", async (req, res) => {
  let requester = auth(req);
  let access = "admin";
  let result = await authenticateUser(requester, access);
  let id = req.body.deadlineID
  let updateFields = req.body.updates
  console.log(req.body);

  if(!result.errorCode) {

    Deadline.findById(id, function (err, deadlineToUpdate) {
      if (err || deadlineToUpdate == null) {
        res.send({responseCode: 204, errorCode: "Record Not Found", errorMessage: "This is not a valid deadline ID!"})
        throw err;
      } else {
        deadlineToUpdate.set(req.body.updateFields);
        deadlineToUpdate.save(function (saveErr, updatedDeadline) {
          console.log('Deadline created' + updatedDeadline);
          if (!saveErr)
          res.send(updatedDeadline);
        });
      }
    });
  } else {
    return result;
  }
});

app.post("/resources/create", async (req, res) => {
  let requester = auth(req);
  let access = "admin";
  let result = await authenticateUser(requester, access);

  if (!result.errorCode) {
    const newResource = new Resource({
      project: req.body.projectid,
      datetime: req.body.datetime,
      title: req.body.title
    });

    newResource.save((err, resource) => {
      if (err) throw err;
      res.send(resource);
    });
  } else {
    res.send(result);
  }
});

// TODO: Fix the trigger fire on Project
app.patch("/resources/update", async (req, res) => {
  let requester = auth(req);
  let access = "admin";
  let result = await authenticateUser(requester, access);
  let id = req.body.resourceID
  let updateFields = req.body.updates
  console.log(req.body);
  if(!result.errorCode) {
    console.log("No errorcode")
    Resource.findById(id, function (err, resourceToUpdate) {
      if (err || resourceToUpdate == null) {
        res.send({responseCode: 204, errorCode: "Record Not Found", errorMessage: "This is not a valid resource ID!"})
        throw err;
      } else {
        resourceToUpdate.set(req.body.updateFields);
        resourceToUpdate.save(function (saveErr, updatedResource) {
          console.log('Resource created' + updatedResource);
          if (!saveErr)
          res.send(updatedResource);
        });
      }
    });
  } else {
    return result;
  }
});

app.post("/projects/create", async (req, res) => {
  let requester = auth(req);
  let access = "admin";
  let result = await authenticateUser(requester, access);

  if (!result.error) {
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
  } else {
    res.send(result);
  }
});

app.get("/projects", async (req, res) => {
  let requester = auth(req);
  let access = "none";
  let result = await authenticateUser(requester, access);
  let projects = [];
  let resultObj = {};
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
          resultObj.user = {"id" : result._id, "username" : result.username};
          resultObj.numberOfResults = projects.length;
          resultObj.projects = projects;
          res.send(resultObj);
        }
      });
    }
  } else {
    res.send(result);
  }
});

module.exports = app;
