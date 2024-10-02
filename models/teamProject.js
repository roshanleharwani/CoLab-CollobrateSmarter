const mongoose = require('mongoose');

const teamProjectSchema = new mongoose.Schema({
  personName: { type: String, required: true },
  projectName: { type: String, required: true },
  description: { type: String, required: true },
  membersRequired: { type: Number, required: true },
  members: { type: Array, default: [] }, // This defines 'members' as an array of strings
});

const TeamProject = mongoose.model('TeamProject', teamProjectSchema);
module.exports = TeamProject;
