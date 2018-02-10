const Project = require("../models/project");
const Deadline = require("../models/deadline");
const Resource = require("../models/resource");
const User = require("../models/user");

module.exports = {

  authenticateUser: async (user, requiredAccess) => {
  return new Promise((resolve, reject) => {
    console.log(`Looking for: ${user}`);
    User.find({ username: user.name, password: user.pass }, (err, found) => {
      if (err || found[0] == null) {
        console.log("Incorrect Password!");
        resolve({
          responseCode: 401,
          errorCode: "Incorrect Password",
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
            responseCode: 401,
            errorCode: "Insufficient Privileges",
            errorMessage: "You don't have access to perform this action!"
          });
        }
      }
    });
  });
},

authenticateWebUser: async (user, requiredAccess) => {
return new Promise((resolve, reject) => {
  console.log(`Looking for: ${user}`);
  User.find({ _id: user.userID }, (err, found) => {
    if (err || found[0] == null) {
      console.log("UserID Not Found!");
      resolve({
        responseCode: 401,
        errorCode: "Incorrect Session ID",
        errorMessage:
          "We did not recognise that session ID, please try again!"
      });
    } else {
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

  getProjects: async (objIDArray) => {
    new Promise(function(resolve, reject) {
      let projects = [];
      console.log('GetProjects Called!');
      console.log(objIDArray);
      if(objIDArray != null)
      for(let i = 0; i < objIDArray.length; ++i) {
        Project.findById(objIDArray[i], function (err, project) {
          console.log(project);
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
          if(i == (objIDArray.length-1)) {
            console.log('GetProjects DONE!');
          resolve(projects);
          }
        });
      }
      // resolve(null);
    });
  }

}
