// grab the things we need
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Project = require('./project');

// create a schema
const resourceSchema = new Schema({
  project: {
    type: Schema.ObjectId,
    ref: 'Project',
  },
  name: { type: String, required: true },
  desc: { type: String, required: true },
  fromDate: Date,
  toDate: Date,
  created_at: Date,
  updated_at: Date,
});

resourceSchema.pre('save', function (next) {
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

// POST Save Trigger
resourceSchema.post('save', (doc) => {
  console.log('%s - New Resource Created', doc._id);
  // Find the project which this record refers to
  Project.findById(doc.project, (err, project) => {
    if (err) {
      throw err;
    } else {
      // Add this resource to the projects.resources array
      console.log(`Adding resource to ${project.title}`);

      // Guard against null vlaue
      if (project.resources == null) {
        project.resources = [];
      }
      // Does this ID already exist in the array?
      if (project.resources.indexOf(doc._id) === -1) {
        project.resources.push(doc._id);
      }
      // Save the project with the updated .resources array.
      project.save((saveError, updatedProject) => {
        if (saveError) {
          throw saveError;
        } else {
          console.log('Project successfully updated!');
          console.log(updatedProject);
        }
      });
    }
  });
});

resourceSchema.post('remove', (doc) => {

});

const Resource = mongoose.model('Resource', resourceSchema);

// make this available to our users in our Node applications
module.exports = Resource;
