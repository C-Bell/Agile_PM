module.exports = {

  // Validates a User object
  user: async (draftUser) => {
    return new Promise(((resolve, reject) => {
      if (draftUser.name != ''
            && draftUser.username != ''
             && draftUser.password != ''
                && draftUser.name != null
                   && draftUser.username != null
                    && draftUser.password != null) {
        resolve({ result: true });
      }
      resolve({ result: false, errorCode: 'Empty Fields', errorMessage: 'Some required fields are blank!' });
    }));
  },

  // Validates a Deadline object
  deadline: async (draftDeadline) => {
    return new Promise(((resolve, reject) => {
      if (draftDeadline.title != ''
         && draftDeadline.datetime != ''
          && draftDeadline.assignee != ''
           && draftDeadline.project != '') {
        resolve({ result: true });
      } else {
        resolve({ result: false, errorCode: 'Empty Fields', errorMessage: 'Some required fields are blank!' });
      }
    }));
  },

  // Validates a Resource object
  resource: async (draftResource) => {
    return new Promise(((resolve, reject) => {
      if (draftResource.name !== ''
         && draftResource.desc !== ''
          && draftResource.fromDate !== ''
           && draftResource.toDate !== ''
            && draftResource.project !== '') {
        resolve({ result: true });
      } else {
        resolve({ result: false, errorCode: 'Empty Fields', errorMessage: 'Some required fields are blank!' });
      }
    }));
  },

  // Validates a Project object
  project: async (draftProject) => {
    return new Promise(((resolve, reject) => {
      if (draftProject.title !== ''
         && draftProject.body !== ''
          && draftProject.date !== '') {
        resolve({ result: true });
      } else {
        resolve({ result: false, errorCode: 'Empty Fields', errorMessage: 'Some required fields are blank!' });
      }
    }));
  },

};
