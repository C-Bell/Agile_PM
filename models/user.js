const mongoose = require('mongoose');
const helpers = require('../helpers/hash');

const Schema = mongoose.Schema;

// create a schema
const userSchema = new Schema({
  name: { type: String },
  desc: { type: String },
  username: { type: String, required: true, unique: true },
  // Password Select: False protects the field from ever being extracted from the db
  password: { type: String, required: true, select: false },
  type: { type: String, required: true },
  imgUrl: { type: String },
  team: String,
  created_at: Date,
  updated_at: Date,
  projects: [{ type: Schema.ObjectId, ref: 'Project' }],
});

// ES6 Notation does not work in Mongoose
// Mongoose is trying to rebind 'this' to the document
userSchema.pre('save', function () {
  // get the current date
  const currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at) {
    this.created_at = currentDate;
  }
});

const User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
