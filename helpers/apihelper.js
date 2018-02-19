const Project = require("../models/project");
const Deadline = require("../models/deadline");
const Resource = require("../models/resource");
const User = require("../models/user");

// Clean Array -
// Input - An array with unpredicted null values
// Returns - New array without null values
const cleanArray = async actual => {
  return new Promise((resolve, reject) => {
    var newArray = new Array();
    for (var i = 0; i < actual.length; i++) {
      if (actual[i]) {
        newArray.push(actual[i]);
      }
    }
    resolve(newArray);
  });
};

// fetchProject - Fetches a single project object with
// unresolved deadlines and resources
// Input - ID
// Output - Project Object
const fetchProject = async projectID => {
  return new Promise((resolve, reject) => {
    if (projectID != null) {
      console.log("Fetching Project: " + projectID);
      Project.findById(projectID, function(err, project) {
        console.log(project);
        resolve(project);
      });
    } else {
      console.error("Attempt to fetch a null object!");
      reject(obj);
    }
  });
};

// fetchProjectUsers - Fetches all users associated with a
// project object
// Input - ID ( Project )
// Output - Array of User Objects
const fetchProjectUsers = async projectID => {
  return new Promise((resolve, reject) => {
    let users = User.find({ projects: projectID });
    resolve(users);
  });
};

// fetchResource - Fetches all resources associated with a
// project object
// Input - ID ( Project )
// Output - Array of Resource Objects
const fetchResource = async resourceID => {
  return new Promise((resolve, reject) => {
    if (resourceID != null) {
      console.log("Fetching Resource: " + resourceID);
      Resource.findById(resourceID, function(err, resource) {
        if (resource != null) {
          console.log(resource);
          resolve(resource);
        } else {
          reject(resource);
        }
      });
    } else {
      console.error("Attempt to fetch a null object!");
      reject(resourceID);
    }
  });
};

// fetchDeadline - Fetches all resources associated with a
// project object
// Input - ID ( Project )
// Output - Array of Deadline Objects
const fetchDeadline = async deadlineID => {
  return new Promise((resolve, reject) => {
    if (deadlineID != null) {
      console.log("Fetching Deadline: " + deadlineID);
      Deadline.findById(deadlineID, function(err, deadline) {
        if (deadline != null) {
          console.log("Deadline Found!");
          console.log(deadline);
          resolve(deadline);
        } else {
          reject(deadline);
        }
      });
    } else {
      console.error("Attempt to fetch a null object!");
      reject(resourceID);
    }
  });
};

module.exports = {
  /* Authentication Method (API)
Input:
* User Object (Username and Password decrypted from basic auth header)
* requiredAccess - Compares the current users access level with that required to
perform the action, this can be 'none' if anyone should be able to perform the action.

Output:
* If the user was found and has the correct access the user object is returned
* Otherwise it returns a specific error message which can be sent back to the client.
*/
  authenticateUser: async (user, requiredAccess) => {
    return new Promise((resolve, reject) => {
      console.log(`Looking for: ${user}`);
      User.find({ username: user.name, password: user.pass }, (err, found) => {
        if (err || found[0] == null) {
          console.log("Incorrect Password!");
          resolve({
            responseCode: 404, // 404 Response Code - User not found
            errorCode: "Incorrect Password",
            // User friendly message
            errorMessage:
              "We did not recognise that username and password, please try again!"
          });
        } else {
          if (found[0].type == requiredAccess || requiredAccess == "none") {
            console.log("User Found, Correct Access!");
            resolve(found[0]);
          } else {
            console.log("User Found, Incorrect Access!");
            resolve({
              responseCode: 401, // 401 Response Code - Insufficient Access
              errorCode: "Insufficient Privileges",
              errorMessage: "You don't have access to perform this action!"
            });
          }
        }
      });
    });
  },

  /* Authentication Method (WEB)
Input:
* User ID (Which we associated with the users session)
* requiredAccess - Compares the current users access level with that required to
perform the action, this can be 'none' if anyone should be able to perform the action.

Output:
* If the user was found and has the correct access the user object is returned
* Otherwise it returns a specific error message which can be sent back to the client.
*/
  authenticateWebUser: async (user, requiredAccess) => {
    return new Promise((resolve, reject) => {
      console.log(`Looking for: ${user}`);
      // Search against the ID
      User.find({ _id: user.userID }, (err, found) => {
        // Not Found -
        if (err || found[0] == null) {
          console.log("UserID Not Found!");
          resolve({
            responseCode: 401,
            errorCode: "Incorrect Session ID",
            errorMessage:
              "We did not recognise that session ID, please try again!"
          });
        } else {
          // Found and correct access
          if (found[0].type == requiredAccess || requiredAccess == "none") {
            console.log("User Found, Correct Access!");
            resolve(found[0]);
          } else {
            console.log("User Found, Incorrect Access!");
            resolve({
              responseCode: 401,
              errorCode: "Insufficient Privileges",
              errorMessage: "You don't have access to perform this action!"
            });
          }
        }
      });
    });
  },

  /* getProject
  Input:
  * Project ID
  Output:
  * A complete object containing all of a projects users, deadlines and resources.
  Note:
  * Uses private functions fetchProject/fetchResource/fetchDeadline
  to fetch and combine all these objects.
  */
  getProject: async objID => {
    let resourceObjs = []; // Holds this projects Resources
    let deadlineObjs = []; // Hold this projects Deadlines
    let project = {}; // Holds this project
    console.log("GetProject Called!");
    console.log("Input: ");
    console.log(objID);
    if (objID != null)
      project.record = await fetchProject(objID).catch(err => {
        console.log(err);
      });
    /* Fetch Resource Records */
    if (project.record.resources != null) {
      for (let j = 0; j < project.record.resources.length; ++j) {
        resourceObjs[j] = await fetchResource(
          project.record.resources[j]
        ).catch(err => {
          console.log(err);
        });
      }
      /* Clean Resource Records */
      project.resourceObjects = await cleanArray(resourceObjs);
    }
    /* Fetch Deadline Records */
    if (project.record.deadlines != null) {
      for (let j = 0; j < project.record.deadlines.length; ++j) {
        deadlineObjs[j] = await fetchDeadline(
          project.record.deadlines[j]
        ).catch(err => {
          console.log(err);
        });
      }
      /* Clean Deadline Records */
      project.deadlineObjects = await cleanArray(deadlineObjs);
    }
    /* Fetch User Records */
    project.users = await fetchProjectUsers(project.record._id);

    return project;
  }
};
