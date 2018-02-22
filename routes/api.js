const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');

// Custom Mongoose Models -
const Project = require('../models/project');
const Deadline = require('../models/deadline');
const Resource = require('../models/resource');
const User = require('../models/user');
const auth = require('basic-auth');

const express = require('express');

const app = express.Router();

const helpers = require('../helpers/apihelper');
const validator = require('../helpers/validator');

const authenticateUser = helpers.authenticateUser;

/* API Routes */

app.get('/login', async (req, res) => {
  // Identify our requester using the session
  const requester = auth(req); // -> {username: x, password: y}
  // Specify the access required to access this route
  const access = 'none';
  // Find out if our user exists and holds the right access
  const result = await authenticateUser(requester, access);
  // If theres not an error, the user exists and meets the access criteria
  if (!result.errorCode) {
    res.status(200);
  } else {
    res.status(404);
  }
  // Returns a human readable error
  res.send(result);
});

/*---------------------------------------------*/
/*                  USER ROUTES                */
/*---------------------------------------------*/

app.get('/users', async (req, res) => {
  const requester = auth(req);
  const access = 'admin';
  const result = await authenticateUser(requester, access);
  // Reply object to store all the fields
  const reply = {};

  // If there wasn't an error
  if (!result.errorCode) {
    // Find a user based on the params provided
    User.find(req.query, (err, users) => {
      if (err) {
        // console.log(err);
        res.send(err);
      }
      // Assign our username as the 'executor'
      reply.executor = requester.name;
      // Specify the success of the request
      reply.success = true;
      // Add our usable data under .record
      reply.record = users;
      res.status(200); // OK Status
      res.send(reply);
    });
  } else {
    res.status(401); // Forbidden Status
    res.send(result); // Return human readable result
  }
});

app.post('/users/create', async (req, res) => {
  const requester = auth(req);
  const access = 'admin';
  const result = await authenticateUser(requester, access);
  const reply = {};

  // console.log(result);
  if (!result.errorCode) {
    const newUser = new User({
      name: `${req.body.first_name} ${req.body.last_name}`,
      username: req.body.username,
      password: req.body.password,
      type: req.body.type,
      projects: null,
    });
    // Is this a valid user object?
    const isValidUser = await validator.user(newUser);
    // Returns either {result : true} or a human readable error.

    if (isValidUser.result) {
      newUser.save((err, savedUser) => {
        if (err) throw err;
        reply.executor = requester.name;
        reply.success = true;
        reply.record = savedUser;
        res.send(reply);
      });
    } else {
      res.send(isValidUser);
    }
  } else {
    res.send(result);
  }
});

app.patch('/users/update', async (req, res) => {
  const requester = auth(req);
  const access = 'none';
  const result = await authenticateUser(requester, access);
  // If a ID is not specified, we assume we are talking about the accessing user
  let findID = req.body.id;
  // If ID is null, we are targetting ourselves the executor.
  if (req.body.id == null) {
    findID = result._id;
  }

  const updateFields = req.body.updates;

  if (!result.errorCode) {
    User.findById(findID, async (err, userToUpdate) => {
      if (err || userToUpdate == null) {
        res.send({ responseCode: 204, errorCode: 'User Not Found', errorMessage: 'This is not a valid user ID!' });
      } else {
        userToUpdate.set(req.body.updateFields);
        // Validate that the new user object still meets our standards,
        const isValidUser = await validator.user(userToUpdate);
        // Returns either {result : true} or a human readable error.

        // If this object is valid
        if (isValidUser.result) {
          //  Save the object
          userToUpdate.save((saveErr, updatedUser) => {
            if (!saveErr) { res.send(updatedUser); }
          });
        } else {
          res.send(isValidUser);
        }
      }
    });
  } else {
    res.send(result);
  }
});

app.delete('/users/delete', async (req, res) => {
  const requester = auth(req);
  const access = 'admin';
  const result = await authenticateUser(requester, access);
  const reply = {};

  if (!result.errorCode) {
    User.find(req.body, (err, found) => {
      // Use the built-in remove function
      found[0].remove();
      // Form the reply object
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

app.get('/deadlines', async (req, res) => {
  const requester = auth(req);
  const access = 'admin';
  const result = await authenticateUser(requester, access);
  const reply = {};
  // console.log(req.query);
  if (!result.errorCode) {
    Deadline.find(req.query, (err, deadlines) => {
      if (err) {
        // console.log(err);
        res.send(err);
      }
      reply.executor = requester.name;
      reply.success = true;
      reply.record = deadlines;
      res.send(reply);
    });
  } else {
    res.send(result);
  }
});

app.post('/deadlines/create', async (req, res) => {
  const requester = auth(req);
  const access = 'none';
  const result = await authenticateUser(requester, access);
  // console.log(result);

  if (!result.errorCode) {
    const newDeadline = new Deadline({
      project: req.body.projectid,
      datetime: req.body.datetime,
      title: req.body.title,
      assignee: req.body.assignee,
    });
    // Is our new object up to the standards in the validator?
    const isValidDeadline = await validator.deadline(newDeadline);

    if (isValidDeadline.result) {
      newDeadline.save((err, deadline) => {
        if (err) throw err;
        res.send(deadline);
      });
    } else {
      // Responds why the object didn't pass the validator
      res.send(isValidDeadline);
    }
  } else {
    // Responds why the user wasn't able to access the route logic
    res.send(result);
  }
});

app.patch('/deadlines/update', async (req, res) => {
  const requester = auth(req);
  const access = 'none';
  const result = await authenticateUser(requester, access);
  const id = req.body.deadlineID;
  const updateFields = req.body.updates;
  // console.log(req.body);
  if (!result.errorCode) {
    // console.log('No errorcode');
    Deadline.findById(id, async (err, deadlineToUpdate) => {
      if (err || deadlineToUpdate == null) {
        res.send({ responseCode: 204, errorCode: 'Record Not Found', errorMessage: 'This is not a valid resource ID!' });
        throw err;
      } else {
        deadlineToUpdate.set(req.body.updateFields);

        const isValidDeadline = await validator.deadline(deadlineToUpdate);

        if (isValidDeadline.result) {
          deadlineToUpdate.save((saveErr, updatedDeadline) => {
            if (!saveErr) { res.send(updatedDeadline); }
          });
        } else {
          res.send(isValidDeadline);
        }
      }
    });
  } else {
    res.send(result);
  }
});


app.delete('/deadlines/delete', async (req, res) => {
  const requester = auth(req);
  const access = 'admin';
  const result = await authenticateUser(requester, access);
  // const id = req.body.deadlineID;
  const updateFields = req.body.updates;
  const reply = {};

  // console.log(req.body);

  if (!result.errorCode) {
    Deadline.find(req.body, (err, deadlineToDelete) => {
      if (err || deadlineToDelete == null) {
        res.send({ responseCode: 204, errorCode: 'Record Not Found', errorMessage: 'This is not a valid deadline ID!' });
      } else {
        deadlineToDelete[0].remove();
        // console.log(`${deadlineToDelete[0]} deadline was successfully deleted!`);
        reply.executor = requester.name;
        reply.success = true;
        reply.record = deadlineToDelete[0];
        res.send(reply);
      }
    });
  } else {
    res.send(result);
  }
});

/*---------------------------------------------*/
/*               RESOURCE ROUTES               */
/*---------------------------------------------*/

app.get('/resources', async (req, res) => {
  const requester = auth(req);
  const access = 'admin';
  const result = await authenticateUser(requester, access);
  const reply = {};
  // console.log(req.query);
  if (!result.errorCode) {
    Resource.find(req.query, (err, resources) => {
      if (err) {
        // console.log(err);
        res.send(err);
      }
      reply.executor = requester.name;
      reply.success = true;
      reply.record = resources;
      res.send(reply);
    });
  } else {
    res.send(result);
  }
});

app.post('/resources/create', async (req, res) => {
  const requester = auth(req);
  const access = 'none';
  const result = await authenticateUser(requester, access);

  if (!result.errorCode) {
    const newResource = new Resource({
      project: req.body.projectid,
      name: req.body.name,
      desc: req.body.desc,
      fromDate: req.body.fromDate,
      toDate: req.body.toDate,
    });
    // Validate our new resource object against the validator
    const isValidResource = await validator.deadline(newResource);

    if (isValidResource.result) {
      // If valid save
      newResource.save((err, resource) => {
        if (err) throw err;
        res.send(resource);
      });
      // Otherwise explain the error
    } else {
      res.send(isValidResource);
    }
  } else {
    res.send(result);
  }
});

app.patch('/resources/update', async (req, res) => {
  const requester = auth(req);
  const access = 'none';
  const result = await authenticateUser(requester, access);
  const id = req.body.resourceID;
  const updateFields = req.body.updates;
  // console.log(req.body);
  if (!result.errorCode) {
    // console.log('No errorcode');
    Resource.findById(id, async (err, resourceToUpdate) => {
      if (err || resourceToUpdate == null) {
        res.send({ responseCode: 204, errorCode: 'Record Not Found', errorMessage: 'This is not a valid resource ID!' });
        throw err;
      } else {
        resourceToUpdate.set(req.body.updateFields);
        // Does the updated object still meet our requirements?
        const isValidResource = await validator.deadline(resourceToUpdate);

        if (isValidResource.result) {
          resourceToUpdate.save((saveErr, updatedResource) => {
            if (!saveErr) { res.send(updatedResource); }
          });
        } else {
          res.send(isValidResource);
        }
      }
    });
  } else {
    res.send(result);
  }
});

app.delete('/resources/delete', async (req, res) => {
  const requester = auth(req);
  const access = 'admin';
  const result = await authenticateUser(requester, access);
  const updateFields = req.body.updates;
  const reply = {};

  // console.log(req.body);

  if (!result.errorCode) {
    Resource.find(req.body, (err, resourceToDelete) => {
      if (err || resourceToDelete[0] == null) {
        res.send({ responseCode: 204, errorCode: 'Record Not Found', errorMessage: 'This is not a valid deadline ID!' });
      } else {
        // console.log(`Matching Records: ${resourceToDelete}`);
        resourceToDelete[0].remove();
        // console.log(`${resourceToDelete[0]} deadline was successfully deleted!`);
        reply.executor = requester.name;
        reply.success = true;
        reply.record = resourceToDelete[0];
        res.send(reply);
      }
    });
  } else {
    res.send(result);
  }
});

/*---------------------------------------------*/
/*                 PROJECT ROUTES              */
/*---------------------------------------------*/

app.get('/projects', async (req, res) => {
  const requester = auth(req);
  const access = 'admin';
  // console.log(requester);
  const result = await authenticateUser(requester, access);
  const reply = {};
  const projectRecords = [];
  if (!result.errorCode) {
    Project.find(req.query, async (err, resources) => {
      if (err) {
        // console.log(err);
        res.send(err);
      }
      for (let i = 0; i < resources.length; ++i) {
        projectRecords[i] = await helpers.getProject(resources[i]);
        projectRecords[i].password = '';
      }
      reply.executor = requester.name;
      reply.success = true;
      reply.record = projectRecords;
      res.status(200);
      res.send(reply);
    });
  } else {
    res.send(result);
  }
});

app.post('/projects/create', async (req, res) => {
  const requester = auth(req);
  const access = 'none';
  const result = await authenticateUser(requester, access);
  const reply = {};

  if (!result.errorCode) {
    // Build our object in accordance to the Schema
    const projectSchema = new Project({
      owner: result._id,
      title: req.body.title,
      body: req.body.body,
      date: req.body.date,
      deadlines: null,
      resources: null,
    });

    // Save our object in accordance to the Schema
    projectSchema.save(async (err, newProject) => {
      if (err) throw err;
      // console.log('Project saved successfully!');
      // Render the project page
      // console.log(newProject);

      const success = await helpers.addProjectToUser(result._id, newProject._id);
      if (success != null) {
        reply.record = newProject;
        reply.executor = result.username;
        reply.usersEffected = success;
        res.send(reply);
      }
    });
  } else {
    res.status(401);
    res.send(result);
  }
});

app.patch('/projects/update', async (req, res) => {
  const requester = auth(req);
  const access = 'none';
  const result = await authenticateUser(requester, access);
  const id = req.body.projectId;
  const updateFields = req.body.updates;
  // //console.log(req.body);
  if (!result.errorCode) {
    // //console.log('No errorcode');
    Project.findById(id, (err, projectToUpdate) => {
      if (err || projectToUpdate == null) {
        res.send({ responseCode: 204, errorCode: 'Record Not Found', errorMessage: 'This is not a valid resource ID!' });
        throw err;
      } else {
        projectToUpdate.set(req.body.updateFields);
        projectToUpdate.save((saveErr, updatedProject) => {
          // //console.log(`Project created ${updatedProject}`);
          if (!saveErr) { res.send(updatedProject); }
        });
      }
    });
  } else {
    res.send(result);
  }
});

app.delete('/projects/delete', async (req, res) => {
  const requester = auth(req);
  const access = 'admin';
  const result = await authenticateUser(requester, access);
  const reply = {};

  // console.log(req.body);

  if (!result.errorCode) {
    Project.find(req.body, async (err, projectToDelete) => {
      if (err || projectToDelete[0] == null) {
        res.send({ responseCode: 204, errorCode: 'Record Not Found', errorMessage: 'This is not a valid deadline ID!' });
      } else {
        // console.log(`Matching Records: ${projectToDelete}`);
        projectToDelete[0].remove();
        // console.log(`${projectToDelete[0]} deadline was successfully deleted!`);
        reply.executor = requester.name;
        reply.success = true;
        reply.record = projectToDelete[0];
        reply.usersEffected = await helpers.removeProjectFromAllUsers(projectToDelete[0]._id);
        res.send(reply);
      }
    });
  } else {
    res.send(result);
  }
});


module.exports = app;
