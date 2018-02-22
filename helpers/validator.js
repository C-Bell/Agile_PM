const fetchDeadline = async (deadlineID) => {
  return new Promise((resolve, reject) => {
    if (deadlineID != null) {
      // console.log(`Fetching Deadline: ${deadlineID}`);
      Deadline.findById(deadlineID, (err, deadline) => {
        if (deadline != null) {
          // console.log('Deadline Found!');
          // console.log(deadline);
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
};

module.exports = {

  user: async (draftUser) => {
    return new Promise(((resolve, reject) => {
      // console.log('Validating User:');
      // console.log(draftUser);
      if (draftUser.name != ''
            && draftUser.username != ''
             && draftUser.password != ''
                && draftUser.name != null
                   && draftUser.username != null
                    && draftUser.password != null) {
        // console.log('No fields are null!');
        resolve({ result: true });
      }
      resolve({ result: false, errorCode: 'Empty Fields', errorMessage: 'Some required fields are blank!' });
    }));
  },

  deadline: async (draftDeadline) => {
    return new Promise(((resolve, reject) => {
      // console.log('Validating Deadline:');
      // console.log(draftDeadline);
      if (draftDeadline.title != ''
         && draftDeadline.datetime != ''
          && draftDeadline.assignee != ''
           && draftDeadline.project != '') {
        // console.log('Fields are all complete!');
        resolve({ result: true });
      } else {
        // console.log('Empty Fields Found!');
        resolve({ result: false, errorCode: 'Empty Fields', errorMessage: 'Some required fields are blank!' });
      }
    }));
  },

  resource: async (draftResource) => {
    return new Promise(((resolve, reject) => {
      // console.log('Validating Resource:');
      // console.log(draftResource);
      if (draftResource.name !== ''
         && draftResource.desc !== ''
          && draftResource.fromDate !== ''
           && draftResource.toDate !== ''
            && draftResource.project !== '') {
        // console.log('Fields are all complete!');
        resolve({ result: true });
      } else {
        // console.log('Empty Fields Found!');
        resolve({ result: false, errorCode: 'Empty Fields', errorMessage: 'Some required fields are blank!' });
      }
    }));
  },

  project: async (draftProject) => {
    return new Promise(((resolve, reject) => {
      // console.log('Validating projects:');
      // console.log(draftProject);
      if (draftProject.title !== ''
         && draftProject.body !== ''
          && draftProject.date !== '') {
        // console.log('Fields are all complete!');
        resolve({ result: true });
      } else {
        // console.log('Empty Fields Found!');
        resolve({ result: false, errorCode: 'Empty Fields', errorMessage: 'Some required fields are blank!' });
      }
    }));
  },

};
