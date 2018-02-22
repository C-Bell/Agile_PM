const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');

// Custom Mongoose Models -
const Project = require('../models/project');
const Deadline = require('../models/deadline');
const Resource = require('../models/resource');
const User = require('../models/user');

// Authentication Middleware -
// Abstracts all authentication to a helper function, returns an error or user object
const authMiddleware = require('../helpers/authMiddleware');
const helpers = require('../helpers/apihelper');
const validator = require('../helpers/validator');
const hash = require('../helpers/hash');

const authenticateUser = helpers.authenticateWebUser;

const express = require('express');

const app = express.Router();

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

/* --------------------------- Public Register POST Request ------------------------- */
/* This route allows us to register a valid user */
/* Which will in turn grant the user access to the whole app */

app.post('/register', async (req, res) => {
  let isValidUser = false;

  const newUser = new User({
    name: `${req.body.first_name} ${req.body.last_name}`,
    username: req.body.username,
    password: hash.hashCode(req.body.password),
    type: 'user',
    projects: null,
  });

  // Check if the input is valid
  isValidUser = await validator.user(newUser);

  console.log(`The result of the validation: ${isValidUser.result}`);

  if (isValidUser.result) {
    newUser.save((err, newUser) => {
      if (err) {
        console.log(err);
      } else {
        console.log('User saved successfully!');
        console.log(newUser);
        // Log the newly registered user in - I.E Authorise this session
        req.session.Authed = true;
        req.session.userID = newUser._id;
        console.log(req.session);

        res.send(newUser);
      }
    });
  } else {
    // Return a human readable error to be rendered on the page
    res.status(400);
    res.send(isValidUser);
  }
});

/* ------------------------------------------------------------------------ */

/* --------------------------- Login POST Request ------------------------- */
/* This route allows us to get an authorised session if we are a valid user */
/* An authorised session then allows us to access any routes below the Middleware Layer */
app.post('/login', (req, res) => {
  console.log('Web POST Login called.');
  console.log(req.body);
  User.find(
    { username: req.body.username, password: hash.hashCode(req.body.password) },
    (err, user) => {
      if (err || user[0] == null) {
        console.log('Not Valid User!');
        res.status(404);
        res.send({
          responseCode: 404,
          errorCode: 'Incorrect Password',
          errorMessage:
            'We did not recognise that username and password, please try again!',
        });
        console.log('Sent!');
      } else {
        // Authorise this session
        // This allows the user to access routes below the middleware layer
        req.session.Authed = true;
        req.session.userID = user[0]._id;
        // console.log(req.session);
        // Send an OK status code for: Successfully executed
        res.sendStatus(200);
      }
    },
  );
});

/* ------------------------------------------------------------------------ */

/* -------------------------- Middleware Layer ----------------------- */
/* Everything below this line requires an authorised session to access */
app.use(authMiddleware);
/* ------------------------------------------------------------------- */

/* --------------------------- Projects GET Request ------------------------- */
/* This route allows us to get all projects available to us i.e associated with our account */
app.get('/projects', async (req, res) => {
  const requester = req.session;
  const access = 'none';
  const result = await authenticateUser(requester, access);
  const projectRecords = [];
  if (!result.errorCode) {
    // Does this user have any projects associated with it?
    if (result.projects != null && result.projects.length > 0) {
      for (let i = 0; i < result.projects.length; ++i) {
        // If so, fetch each one and add it to our array
        projectRecords[i] = await helpers.getProject(result.projects[i]);
      }
      // Return the array
      res.send(projectRecords);
    } else {
      // Return 'No Content'
      res.send(204);
    }
  } else {
    // Return the human readable auth error
    res.status(401);
    res.send(result);
  }
});

/* ------------------------------------------------------------------- */

// Get this User Object
app.get('/user', async (req, res) => {
  const requester = req.session;
  const access = 'none';
  const result = await authenticateUser(requester, access);
  delete result.password;
  res.send(result);
});

// Delete a project deadline/resource
app.delete('/delete', async (req, res) => {
  const requester = req.session;
  const access = 'admin';
  const result = await authenticateUser(requester, access);
  delete result.password;
  if (!result.errorCode) {
    Deadline.findOneAndRemove({ _id: req.body.id }, (err) => {
      if (err) {
        console.log(err);
      }
    });

    Resource.findOneAndRemove({ _id: req.body.id }, (err) => {
      if (err) {
        console.log(err);
      }
    });
  } else {
    res.status(401);
    res.send(result);
  }
});

app.get('/projects/:pID', async (req, res) => {
  const requester = req.session;
  const access = 'none';
  const result = await authenticateUser(requester, access);
  // let userList = await helpers.getUserList();
  let projectRecord = {};
  if (!result.errorCode) {
    projectRecord = await helpers.getProject([req.params.pID]);

    if (projectRecord != null) {
      User.find({}, (err, userList) => {
        // console.log(userList);
        res.render('project', {
          project: projectRecord.record,
          deadlines: projectRecord.deadlineObjects,
          resources: projectRecord.resourceObjects,
          users: projectRecord.users,
          user: result,
          allUsers: userList,
          // helpers: { // TODO
          //   isAdmin(result) {
          //     if (result.type == null) { return true; } return false;
          //   },
          //   isUserOrAbove(result) { if (result.type === 'admin' || result.type == 'user') { return true; } return false; },
          // },
        });
      });
    } else {
      res.send(404);
    }
  } else {
    res.send(result.error);
  }
});

app.post('/projects/create', async (req, res) => {
  const requester = req.session;
  const access = 'none';
  const result = await authenticateUser(requester, access);
  let isValidUser = false;
  console.log('New Project: ');
  console.log(req.body);


  if (!result.errorCode) { // Is this a valid user?
    const projectSchema = new Project({
      owner: result._id,
      title: req.body.title,
      body: req.body.body,
      date: req.body.date,
      deadlines: null,
      resources: null,
    });

    isValidUser = await validator.project(projectSchema);

    if (isValidUser.result) {
      projectSchema.save(async (err, newProject) => {
        if (err) throw err;
        console.log('Project saved successfully!');
        // Render the project page
        console.log(newProject);

        const success = await helpers.addProjectToUser(result._id, newProject._id);
        if (success != null) {
          res.send(success);
        }
      });
    } else {
      res.status(400);
      res.send(isValidUser);
    }
  } else { // Send result which is a Error JSON object
    res.status(401);
    res.send(result);
  }
});

app.post('/projects/addUser', async (req, res) => {
  const requester = req.session;
  const access = 'admin';
  const result = await authenticateUser(requester, access);
  console.log(`Attempting to Add ${req.body.userId} to ${req.body.projectId}`);
  console.log(req.body);
  console.log(result);

  if (!result.errorCode) { // Is this a valid user?
    const success = await helpers.addProjectToUser(req.body.userId, req.body.projectId);
    // success = await helpers.addUserToProject(req.body.userId, req.body.projectId);
    console.log(success);
    res.send(success);
  } else { // Send result which is a Error JSON object
    res.status(401);
    res.send(result);
  }
});

app.post('/projects/removeUser', async (req, res) => {
  const requester = req.session;
  const access = 'none';
  const result = await authenticateUser(requester, access);
  console.log(`Removing ${req.body.userId} from ${req.body.projectId}`);
  console.log(req.body);

  if (!result.error) { // Is this a valid user?
    const success = await helpers.removeProjectFromUser(req.body.userId, req.body.projectId);
    console.log(success);
    res.send(success);
  } else { // Send result which is a Error JSON object
    res.send(result);
  }
});

app.post('/deadlines/create', async (req, res) => {
  const requester = req.session;
  const access = 'none';
  const result = await authenticateUser(requester, access);
  let isValidDeadline = false;
  console.log('Input from user for new Deadline: ');
  console.log(req.body);

  if (!result.errorCode) { // Is this a valid user?
    const newDeadline = new Deadline({
      project: req.body.project,
      datetime: req.body.datetime,
      title: req.body.title,
      assignee: req.body.assignee,
    });

    isValidDeadline = await validator.deadline(newDeadline);

    console.log(isValidDeadline.result);

    if (isValidDeadline.result === true) {
      newDeadline.save((err, deadline) => {
        if (err) throw err;
        res.send(deadline);
      });
    } else { // Send Error Code
      res.status(400);
      res.send(isValidDeadline);
    }
  }
});

app.post('/deadlines/update', async (req, res) => {
  const requester = req.session;
  const access = 'none';
  const result = await authenticateUser(requester, access);
  console.log('Input from user for deadline update: ');
  console.log(req.body);

  if (!result.errorCode) { // Is this a valid user?
    Deadline.findById(req.body.deadlineId, (err, deadlineToUpdate) => {
      if (err) { console.log(err); }
      deadlineToUpdate.status = req.body.newState;
      deadlineToUpdate.save((err, deadline) => {
        if (err) throw err;
        res.status(200);
        res.send(deadline);
      });
    });
  }
});

app.post('/resources/create', async (req, res) => {
  const requester = req.session;
  const access = 'none';
  const result = await authenticateUser(requester, access);
  let isValidResource = false;

  if (!result.errorCode) {
    const newResource = new Resource({
      project: req.body.project,
      name: req.body.name,
      desc: req.body.desc,
      fromDate: req.body.fromDate,
      toDate: req.body.toDate,
    });

    isValidResource = await validator.resource(newResource);

    if (isValidResource.result) {
      newResource.save((err, resource) => {
        if (err) throw err;
        res.send(resource);
      });
    } else {
      res.status(400);
      res.send(isValidResource);
    }
  } else {
    res.status(401);
    res.send(result);
  }
});

app.post('/search', async (req, res) => {
  const requester = req.session;
  const access = 'none';
  const result = await authenticateUser(requester, access);
  const objresults = [];
  let projectRecord;
  console.log('New Search: ');
  console.log(req.body.search);

  if (!result.errorCode) {
  // REGEX Search function is passed to the MongoDB and executed
    Project.find({ title: { $regex: req.body.search, $options: 'i' } }, async (err, docs) => {
    // Docs is an array of matching ID's
      console.log(docs);
      for (let i = 0; i < docs.length; ++i) {
      // Synchronously call our async function getProject to resolve the array.
        projectRecord = await helpers.getProject(docs);
        objresults.push(projectRecord);
      }
      // If we didn't get any matches, send a JSON error
      if (objresults.length < 1) {
        res.send({ error: 'No results found', errorMessage: 'We could not find any Project records matching your search term!' });
      } else {
      // Send results
        res.send(objresults);
      }
    });
  } else {
    // Send Invalid credentials error
    res.status(401);
    res.send(result);
  }
});

app.get('/search', async (req, res) => {
  const requester = req.session;
  const access = 'none';
  const result = await authenticateUser(requester, access);
  delete result.password;
  // Render the value of result into the page as 'user'
  res.render('search', {
    user: result, // Pass the current logged in user into the page for rendering.
  });
});

app.get('/', async (req, res) => {
  const requester = req.session;
  const access = 'none';
  const result = await authenticateUser(requester, access);
  delete result.password;
  // Render the value of result into the page as 'user'
  res.render('home', {
    user: result,
  });
});

app.get('/logout', async (req, res) => {
  const requester = req.session;
  const access = 'none';
  const result = await authenticateUser(requester, access);
  // Set our session authed state to false to prevent further access
  req.session.Authed = false;
  // Render the login page for the user
  res.render('login');
});

app.get('/newprojects', async (req, res) => {
  const requester = req.session;
  const access = 'none';
  const result = await authenticateUser(requester, access);
  delete result.password;
  // Render the value of result into the page as 'user'
  res.render('newproject', {
    user: result,
  });
});

app.get('/home', async (req, res) => {
  const requester = req.session;
  const access = 'none';
  const result = await authenticateUser(requester, access);
  delete result.password;
  // Render the value of result into the page as 'user'
  res.render('home', {
    user: result,
  });
});

module.exports = app;
