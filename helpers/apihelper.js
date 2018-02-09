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
}
// },
//
//   getProjects: async (objIDArray) => {
//     new Promise(function(resolve, reject) {
//       // let projects = [];
//
//       // console.log(projects);
//       resolve("Hello World");
//     });
//   }

}
