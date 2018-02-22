const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');

const should = chai.should();
const assert = chai.assert;

chai.use(chaiHttp);

it('Server returns status 200', (done) => {
  chai.request(server)
    .get('/')
    .end((err, res) => {
      res.should.have.status(200);
      done();
    });
});

describe('Object CRUD Tests', () => {
  it('Test Project Creation & Validation', (done) => {
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

  it('WEB - Server will only share pages to unauthorised users', (done) => {
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
