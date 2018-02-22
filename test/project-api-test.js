const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');

const should = chai.should();
const assert = chai.assert;


chai.use(chaiHttp);

// Example test to ensure the server is running and the test suite is working.
it('Server returns status 200', (done) => {
  chai.request(server)
    .get('/')
    .end((err, res) => {
      res.should.have.status(200);
      done();
    });
});

/* Test Suite One */
/* Testing account creation on valid/invalid and admin/nonadmin accounts.
 * This allows us to check that objects are created correctly and that all
 * Login auth on the API is working as expected
 * Dependencies are updated on the User object to reflect the changes
 */

// Describe - Defines a subheading for a group of tests
describe('API - Project Creation', () => {
  // Success criteria - Valid User, Admin Account
  it('API - Project Creation (Correct User Credentials | Admin)', (done) => {
    /* Initialisation of Objects */
    const userCredentials = {
      username: 'cmsbates',
      password: 'password',
    };

    const projectDetails = {
      title: 'My First Project',
      body: 'With an aim to build a project management system',
      date: 'Mon Jan 29 2018 15:34:31 GMT+0000 (GMT)',
    };

    let projectID = null;
    /* -------------------------- */

    // Request a publically available page without proper credentials
    chai.request(server)
    /* Create new Project with sample User */
      .post('/api/projects/create')
      .auth(userCredentials.username, userCredentials.password)
      .send(projectDetails)
      .end((err, res) => {
        // Check the server responded as expected
        res.should.have.status(200);
        // Ensure the record returned has an ID
        res.body.record.should.have.property('_id');
        // Check that key input fields are exact matches with the response
        projectID = res.body.record._id;
        console.log(`ID: ${res.body.record._id}`);
        assert((res.body.record.title === projectDetails.title), 'Title is correct!');
        assert((res.body.record.body === projectDetails.body), 'Body is correct!');

        /* Check that all dependencies have been updated on the user */
        chai.request(server)
          .get('/api/login')
          .auth(userCredentials.username, userCredentials.password)
          .end((err, res) => {
            console.log(res.body);
            // Check the server responded as expected
            res.should.have.status(200);
            // Check that key input fields are exact matches with the response
            assert((res.body.projects.indexOf(projectID) != -1), 'Project found in user.projects correctly!');
            done();
          });
      });

    // Request a publically available page without proper credentials
  });

  // Success criteria - Invalid User
  it('API - Project Creation (Wrong User Credentials)', (done) => {
    /* Initialisation of Objects */
    const userCredentials = {
      username: 'error',
      password: 'error',
    };

    const projectDetails = {
      title: 'My First Project',
      body: 'With an aim to build a project management system',
      date: 'Mon Jan 29 2018 15:34:31 GMT+0000 (GMT)',
    };

    const projectID = null;
    /* -------------------------- */

    // Request a publically available page without proper credentials
    chai.request(server)
    /* Create new Project with sample User */
      .post('/api/projects/create')
      .auth(userCredentials.username, userCredentials.password)
      .send(projectDetails)
      .end((err, res) => {
        // Check the server responded as expected
        // console.log(res.body);
        res.should.have.status(401);
        // Ensure the record returned has an ID
        res.body.should.have.property('errorCode');
        // Check that key input fields are exact matches with the response
        done();
      });

    // Request a publically available page without proper credentials
  });

  // Success Criteria - Valid User, Non - Admin
  it('API - Test Project Creation and User Dependencies', (done) => {
  /* Initialisation of Objects */
    const userCredentials = {
      username: 'cmsbates',
      password: 'password',
    };

    const projectDetails = {
      title: 'My First Project',
      body: 'With an aim to build a project management system',
      date: 'Mon Jan 29 2018 15:34:31 GMT+0000 (GMT)',
    };

    let projectID = null;
    /* -------------------------- */

    // Request a publically available page without proper credentials
    chai.request(server)
    /* Create new Project with sample User */
      .post('/api/projects/create')
      .auth(userCredentials.username, userCredentials.password)
      .send(projectDetails)
      .end((err, res) => {
      // Check the server responded as expected
        res.should.have.status(200);
        // Ensure the record returned has an ID
        res.body.record.should.have.property('_id');
        // Check that key input fields are exact matches with the response
        projectID = res.body.record._id;
        // console.log(`ID: ${res.body.record._id}`);
        assert((res.body.record.title === projectDetails.title), 'Title is correct!');
        assert((res.body.record.body === projectDetails.body), 'Body is correct!');

        /* Check that all dependencies have been updated on the user */
        chai.request(server)
          .get('/api/login')
          .auth(userCredentials.username, userCredentials.password)
          .end((err, res) => {
            // Check the server responded as expected
            res.should.have.status(200);
            // Check that key input fields are exact matches with the response
            assert((res.body.projects.indexOf(projectID) != -1), 'Project found in user.projects correctly!');
            done();
          });
      });
  });
});

/* Test Suite Two */
/* Testing the security of our router by seeing if any pages are accessible
 * to unauthorised users that shouldnt.
 * Login auth on the Web is working as expected
 * AuthMiddleware is working as expected
 */
describe('Web Access Tests', () => {
  // Login is public so it should return 200 and the page content
  // projects is not public so it should return 401
  it('WEB - Server will only share public pages to unauthorised users', (done) => {
    // Request a publically available page without proper credentials
    chai.request(server)
      .get('/login')
      .end((err, res) => {
        res.should.have.status(200);
        // Check that our result is a 200
        done();
      });


    // Request a private page without proper credentials
    chai.request(server)
      .get('/projects')
      .end((err, res) => {
        res.should.have.status(401);
        // Check that our result is a 404
        done();
      });
  });
});

/* Test Suite Three */
/* Testing the security of our router by seeing if the API will leak data
 * Even if the user accessing doesn't have the right access level
 */

describe('API Access Tests', () => {
  // An admin should gain access to this data
  it('API - Request all users (Admin)', (done) => {
    // Request a publically available page without proper credentials
    const adminCredentials = {
      username: 'cmsbates',
      password: 'password',
    };

    chai.request(server)
      .get('/api/users')
      .auth(adminCredentials.username, adminCredentials.password)
      .end((err, res) => {
        console.log(res.body);
        assert((res.body.success === true), 'Fetched successfully!');
        assert((res.body.executor === adminCredentials.username), 'Executor object matches!');
        // // Check that our result is a 200
        done();
      });
  });
  // A user should not gain access to this data
  it('API - Request all users (User)', (done) => {
    const userCredentials = {
      username: 'sampleuser',
      password: 'password',
    };

    chai.request(server)
      .get('api/users')
      .auth(userCredentials.username, userCredentials.password)
      .end((err, res) => {
        // res.should.have.status(200);
        console.log(res);
        // res.should.have.status(200);
        // Check that our result is a 200
        done();
      });
  });
});


// Web Routes Public Pages Test

//
// it('WEB - User recieves an authorised session and can access /home', (done) => {
//   const userCredentials = {
//     username: 'cmsbates',
//     password: 'password',
//   };
//
//   console.log('Sending valid credentials to /login');
//
//   chai.request(server)
//     .post('/login')
//     .send(userCredentials)
//     .end((err, res) => {
//       console.log('Checking our response and session');
//       console.log(`HEADER : ${JSON.stringify(res.header)}`);
//       res.should.have.status(200);
//       done();
//     //   console.log('Requesting /home which is a protected page');
//     //   chai.request(server)
//     //     .get('/home')
//     //     .end((err, pageRes) => {
//     //       pageRes.should.have.status(200);
//     //       // Check that our result is a 404
//     //       done();
//     //     });
//     });
//   // done();
// });
//
// // API Routes Authentication
// it('User is able to access correct API routes with valid credentials', (done) => {
//   const userCredentials = {
//     username: 'cmsbates',
//     password: 'password',
//   };
//
//   chai.request(server)
//     .post('/api/login')
//     .auth(userCredentials.username, userCredentials.password)
//     .end((err, res) => {
//       console.log(`Response Recieved: ${JSON.stringify(res.body.username)}`);
//       res.should.have.status(200);
//       done();
//     });
//   // Then check if the user can GO TO HOME
// });
//
// // Create project
// res.body.errors.pages.should.have.property('kind').eql('required');
