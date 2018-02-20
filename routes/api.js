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

app.post("/login", async (req, res) => {
  let requester = auth(req);
  let access = "none";
  let result = await authenticateUser(requester, access);
  console.log(result);
  if(result.errorCode) {
    res.status(404);
  } else {
    res.status(200);
  }
  res.send(result);
});

// app.get("/users", async (req, res) => {
//   let requester = auth(req);
//   let access = "none";
//   let result = await authenticateUser(requester, access);
//   console.log(result);
//   if (!result.errorCode) {
//   User.find({}, function (err, users) {
//           res.send(users);
//       });
//   });
//   } else {
//     res.send(result);
//   }
// });
/*---------------------------------------------*/
/*                  USER ROUTES                */
/*---------------------------------------------*/

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
  let access = "none";
  let result = await authenticateUser(requester, access);
  // let id = req.body.userID
  let updateFields = req.body.updates
  console.log(req.body);

  if(!result.errorCode) {

    User.findById(result._id, function (err, userToUpdate) {
      if (err || userToUpdate == null) {
        console.log('cust error');
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

app.delete("/users/delete", async (req, res) => {
  console.log(req.body);
  let requester = auth(req);
  let access = "admin";
  let result = await authenticateUser(requester, access);
  let reply = {};
  if (!result.errorCode) {
    User.find(req.body, (err, found) => {
      console.log(`${found.name}'s account was successfully deleted!`);
      console.log(found[0]);
      found[0].remove();
      reply.executor = requester.name;
      reply.success = true;
      reply.record = found;
      res.send(reply);
    });
  } else {
    res.send(result);
  }
});

/*---------------------------------------------*/
/*               DEADLINE ROUTES               */
/*---------------------------------------------*/

app.post("/deadlines/create", async (req, res) => {
  let requester = auth(req);
  let access = "admin";
  let result = await authenticateUser(requester, access);
  console.log(result);

  if (!result.errorCode) {
    const newDeadline = new Deadline({
      project: req.body.projectid,
      datetime: req.body.datetime,
      title: req.body.title,
      assignee: req.body.assignee,
    });

    newDeadline.save((err, deadline) => {
      if (err) throw err;
      res.send(deadline);
    });
  } else {
    res.send(result);
  }
});

//

// TODO: Fix the trigger fire on Project
app.delete("/deadlines/delete", async (req, res) => {
  let requester = auth(req);
  let access = "admin";
  let result = await authenticateUser(requester, access);
  let id = req.body.deadlineID
  let updateFields = req.body.updates
  let reply = {};

  console.log(req.body);

  if(!result.errorCode) {

    Deadline.find(req.body, function (err, deadlineToDelete) {
      if (err || deadlineToDelete == null) {
        res.send({responseCode: 204, errorCode: "Record Not Found", errorMessage: "This is not a valid deadline ID!"})
      } else {
        deadlineToDelete[0].remove();
        console.log(`${deadlineToDelete[0]} deadline was successfully deleted!`);
        reply.executor = requester.name;
        reply.success = true;
        reply.record = deadlineToDelete[0];
        res.send(reply);
      }
        });
  } else {
      return result;
    }
});

/*---------------------------------------------*/
/*               RESOURCE ROUTES               */
/*---------------------------------------------*/

app.post("/resources/create", async (req, res) => {
  let requester = auth(req);
  let access = "admin";
  let result = await authenticateUser(requester, access);

  if (!result.errorCode) {
    const newResource = new Resource({
      project: req.body.projectid,
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

app.delete("/resources/delete", async (req, res) => {
  let requester = auth(req);
  let access = "admin";
  let result = await authenticateUser(requester, access);
  let updateFields = req.body.updates
  let reply = {};

  console.log(req.body);

  if(!result.errorCode) {

    Resource.find(req.body, function (err, resourceToDelete) {
      if (err || resourceToDelete[0] == null) {
        res.send({responseCode: 204, errorCode: "Record Not Found", errorMessage: "This is not a valid deadline ID!"})
      } else {
        console.log(`Matching Records: ${resourceToDelete}`)
        resourceToDelete[0].remove();
        console.log(`${resourceToDelete[0]} deadline was successfully deleted!`);
        reply.executor = requester.name;
        reply.success = true;
        reply.record = resourceToDelete[0];
        res.send(reply);
      }
        });
  } else {
      return result;
    }
});

/*---------------------------------------------*/
/*                 PROJECT ROUTES              */
/*---------------------------------------------*/

app.post("/projects/create", async (req, res) => {
  let requester = auth(req);
  let access = "admin";
  let result = await authenticateUser(requester, access);

  if (!result.error) {

    // Build our object in accordance to the Schema
    let projectSchema = new Project({
      owner: result._id,
      title: req.body.title,
      body: req.body.body,
      date: req.body.date,
      deadlines: null,
      resources: null
    });

    // Save our object in accordance to the Schema
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

// app.get("/projects", async (req, res) => {
//   let requester = auth(req);
//   let access = "none";
//   console.log(requester);
//   let result = await authenticateUser(requester, access);
//   let resultObj = {};
//   if (!result.error) {
//     helpers.getProjects(result.projects).then((projects) => {
//       console.log(projects);
//     })
//     // resultObj.numberOfRecords = projects.length;
//     // resultObj.executor = { "username" : result.username};
//     // res.send(resultObj);
//   } else {
//     res.send(result);
//   }
// });

// app.get("/projects", async (req, res) => {
//   let requester = auth(req);
//   let access = "none";
//   let result = await authenticateUser(requester, access);
//   let projects = [];
//   let resultObj = {};
//   if (!result.error) {
//     for(let i = 0; i < result.projects.length; ++i) {
//       Project.findById(result.projects[i], function (err, project) {
//         // TODO: Return resources and deadlines as projects
//         console.log('Resources:');
//         console.log(project.resources)
//         // if(project.resources != null) {
//         //   if(project.resources.length != 0) {
//         //     let resources = [];
//         //     for(let j = 0; j < project.resources.length; ++j) {
//         //       console.log(project.resources[j]);
//         //       Resource.findById(project.resources[j], function (err, resource) {
//         //         console.log('Resource Found! : ' + resource);
//         //         if(resource != null) {
//         //           resources.push(resource);
//         //         }
//         //       });
//         //     }
//         //     console.log('ALL resources');
//         //     console.log(resources);
//         //     project.resourceObjs = resources;
//         //
//         // }
//
//         projects.push(project);
//         if(i == (result.projects.length-1)) {
//           resultObj.user = {"id" : result._id, "username" : result.username};
//           resultObj.numberOfResults = projects.length;
//           resultObj.projects = projects;
//           res.send(resultObj);
//         }
//       });
//     }
//   } else {
//     res.send(result);
//   }
// });

module.exports = app;
