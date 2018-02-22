const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const User = require('./user');

// create a schema
const projectSchema = new Schema({
  owner: {
    type: Schema.ObjectId,
    ref: 'User',
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
  const currentDate = new Date();

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
projectSchema.post('save', (doc) => {
  console.log('%s has been saved to the db', doc._id);
});

// the schema is useless so far
// we need to create a model using it
const Project = mongoose.model('Project', projectSchema);

// make this available to our users in our Node applications
module.exports = Project;
