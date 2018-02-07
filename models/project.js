// grab the things we need
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const User = require('./user');

// create a schema
const projectSchema = new Schema({
  owner: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  title: String,
  body: String,
  date: Date,
  created_at: Date,
  updated_at: Date,
  deadlines: [{ type: Schema.ObjectId, ref: 'Deadline' }],
  resources: [{ type: Schema.ObjectId, ref: 'Resource' }],
});

// ES6 Notation does not work in Mongoose
// Mongoose is trying to rebind 'this' to the document
projectSchema.pre('save', function (next) {
  // get the current date
  let currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at) {
    this.created_at = currentDate;
  }

  next();
});

// ES6 Notation does not work in Mongoose
// Mongoose is trying to rebind 'this' to the document
projectSchema.post('save', function (doc) {
  console.log('%s has been saved to the db', doc._id);
  User.findById(doc.owner, (err, user) => {
    if (err || user == null) {
      console.log('Project not found!');
    } else {
      console.log('Found ' + user);
      // Guard against null vlaue
      if(user.projects == null) {
        user.projects = [];
      }
      if(!user.projects.includes(doc._id)) {
        user.projects.push(doc._id);

        user.save((saveError, updatedUser) => {
          if (saveError) {
            throw saveError;
          } else {
            console.log('User successfully updated!');
            console.log(updatedUser);
          }
        });
      }
    }
  });
});

// the schema is useless so far
// we need to create a model using it
const Project = mongoose.model('Project', projectSchema);

// make this available to our users in our Node applications
module.exports = Project;
