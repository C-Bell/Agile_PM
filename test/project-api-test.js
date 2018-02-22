const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');

chai.use(chaiHttp);

it('Server returns status 200', (done) => {
  chai.request(server)
    .get('/')
    .end((err, res) => {
      res.should.have.status(200);
      done();
    });
});

// Web Routes Public Pages Test
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
      // console.log(res);
      expect(res).to.redirect; // Check that our result is a 404
      done();
    });
});
//
// it('WEB - User recieves an authorised session and can access /home', (done) => {
//  expect(res).to.have.cookie('session_id');


/* var agent = chai.request.agent(app)
agent
.post('/session')
.send({ username: 'me', password: '123' })
.then(function (res) {
  expect(res).to.have.cookie('sessionid');
  // The `agent` now has the sessionid cookie saved, and will send it
  // back to the server in the next request:
  return agent.get('/user/me')
    .then(function (res) {
       expect(res).to.have.status(200);
    })
}) */
// const userCredentials = {
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
it('Test Project Creation & Validation', (done) => {
  const userCredentials = {
    username: 'cmsbates',
    password: 'password',
  };

  const projectDetails = {
    title: 'My First Project',
    body: 'With an aim to build a project management system',
    date: 'Mon Jan 29 2018 15:34:31 GMT+0000 (GMT)',
  };
  // Request a publically available page without proper credentials
  chai.request(server)
    .post('/api/projects/create')
    .auth(userCredentials.username, userCredentials.password)
    .send(projectDetails)
    .end((err, res) => {
      // console.log('Response Created: ');
      // console.log(res.body);
      res.should.have.status(200);
      res.body.should.have.property('_id');
      // Check that our result is a 200
      done();
    });
});
