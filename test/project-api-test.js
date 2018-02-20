var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();

chai.use(chaiHttp);

it('Server returns status 200', function(done) {
  chai.request(server)
    .get('/')
    .end(function(err, res){
      res.should.have.status(200);
      done();
    });
});

// Web Routes Public Pages Test
it('Server wont private share pages to any unauthorised users', function(done) {

// Request a publically available page without proper credentials
  chai.request(server)
    .get('/login')
    .end(function(err, res) {
      res.should.have.status(200);
      // Check that our result is a 200
      done();
    });

// Request a private page without proper credentials
    chai.request(server)
      .get('/projects')
      .end(function(err, res) {
        res.should.have.status(404);
        // Check that our result is a 404
        done();
      });
});

// API Routes Authentication TODO
// it('User recieves an authorised session and can access /home', function(done) {
//
//   const userCredentials = {
//   username: 'adminbecsauce',
//   password: 'password'
// }
//
// chai.request(server)
//   .post('/login')
//   .send(userCredentials)
//   .end(function(err, res) {
//     console.log(res.session);
//     res.should.have.status(200);
//     done();
//   });
//   // done();
// });

// API Routes Authentication TODO
// it('User is able to access correct API routes with valid credentials', function(done) {
//
//   const userCredentials = {
//   username: 'adminbecsauce',
//   password: 'password'
// }
//
// chai.request(server)
//   .post('/api/login')
//   .auth(userCredentials.username, userCredentials.password)
//   .end(function(err, res) {
//     console.log('Response Recieved: ' + res);
//     res.should.have.status(200);
//     done();
//   });
//   // Then check if the user can GO TO HOME
// });

// Create project
it('Test Project Creation & Validation', function(done) {

  const userCredentials = {
  username: 'adminbecsauce',
  password: 'password'
  }

  const projectDetails = {
    "title": "My First Project",
    "body": "With an aim to build a project management system",
    "date": "Mon Jan 29 2018 15:34:31 GMT+0000 (GMT)"
}
// Request a publically available page without proper credentials
  chai.request(server)
    .post('/login')
    .auth(userCredentials.username, userCredentials.password)
    .send(projectDetails)
    .end(function(err, res) {
      console.log(res);
      res.should.have.status(200);
      // Check that our result is a 200
      done();
    });

// Request a private page without proper credentials
    chai.request(server)
      .get('/projects')
      .end(function(err, res) {
        res.should.have.status(404);
        // Check that our result is a 404
        done();
      });
});
