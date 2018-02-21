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
  // TODO: Validation Set-up

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

resourceSchema.post('save', (doc) => {
  console.log('%s - New Resource Created', doc._id);
  Project.findById(doc.project, (err, project) => {
    if (err) {
      throw err;
    } else {
      console.log(`Adding resource to ${project.title}`);
      // Guard against null vlaue
      if (project.resources == null) {
        project.resources = [];
      }
      if (project.resources.indexOf(doc._id) === -1) {
        project.resources.push(doc._id);
      }
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
  });
});

resourceSchema.post('remove', (doc) => {
  // console.log('%s - Resource Deleted', doc);
  // Project.find(doc.project, (err, project) => {
  //   console.log(project);
  //   const index = project.resources.indexOf(doc._id);
  //
  //   if(index !== -1) {
  //     project.resources = project.resources.splice(index, 1);
  //   }
  //
  //   project.save((saveError, updatedProject) => {
  //     if (saveError) {
  //       throw saveError;
  //     } else {
  //       console.log('Project successfully updated!');
  //       console.log(updatedProject);
  //     }
  //   });

  // TODO: Remove from project on delete
  // if (err) {
  //   throw err;
  // } else {
  //   console.log('Adding resource to ' + project.title);
  //   // Guard against null vlaue
  //   if(project.resources == null) {
  //     project.resources = [];
  //   }
  //   project.resources.push(doc._id);
  //   // TODO: Change to update to prevent multiple trigger fires
  //   project.save((saveError, updatedProject) => {
  //     if (saveError) {
  //       throw saveError;
  //     } else {
  //       console.log('Project successfully updated!');
  //       console.log(updatedProject);
  //     }
  //   });
  // }
  // });
});

const Resource = mongoose.model('Resource', resourceSchema);

// make this available to our users in our Node applications
module.exports = Resource;
