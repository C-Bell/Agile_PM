// grab the things we need
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Project = require('./project');

// create a schema
const deadlineSchema = new Schema({
  project: {
    type: Schema.ObjectId,
    ref: 'Project'
  },
  datetime: Date,
  title: { type: String, required: true },
  created_at: Date,
  updated_at: Date,
});

deadlineSchema.pre('save', function (next) {
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

deadlineSchema.post('save', function (doc) {
  console.log('%s has been saved to the db', doc._id);
  Project.findById(doc.project, (err, project) => {
    if (err) {
      throw err;
    } else {
      if(project != null) {
        console.log('Found ' + project);
        // Guard against null vlaue
        if(project.deadlines == null) {
          console.log('setting null to []');
          project.deadlines = [];
        }
        project.deadlines.push(doc._id);
        // TODO: Change to update to prevent multiple trigger fires
        project.save((saveError, updatedProject) => {
          if (saveError) {
            throw saveError;
          } else {
            console.log('Project successfully updated!');
            console.log(updatedProject);
          }
        });
      }

    }
  });
});

const Deadline = mongoose.model('Deadline', deadlineSchema);

// make this available to our users in our Node applications
module.exports = Deadline;
