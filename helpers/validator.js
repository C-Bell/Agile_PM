

const fetchDeadline = async (deadlineID) => {
  return new Promise((resolve, reject) => {
    if(deadlineID != null) {
      console.log('Fetching Deadline: ' + deadlineID);
      Deadline.findById(deadlineID, function (err, deadline) {
        if(deadline != null) {
          console.log('Deadline Found!');
          console.log(deadline);
          resolve(deadline);
        } else {
          reject(deadline);
        }
      });
    } else {
      console.error('Attempt to fetch a null object!');
      reject(resourceID);
    }
  });
}

module.exports = {

  user: async (draftUser) => {
    new Promise(function(resolve, reject) {
      console.log(draftUser);
        if(draftUser.first_name != null
           && draftUser.last_name != null
            && draftUser.username != null
             && draftUser.password != null) {
               if(password.length < 4) {
                 console.log('Password too short!');
                 resolve({result: false, reason: 'Too few characters in password'});
               }
             }
        console.log('No fields are null!');
        resolve({ result: true });
  });
  }

}
